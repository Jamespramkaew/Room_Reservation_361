import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    PutObjectCommand,
    DeleteObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {

    private readonly s3Client: S3Client;
    private readonly bucketName: string;


    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION')!,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
            },
        });
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET')!
    };

    async uploadFile(
        file: Express.Multer.File,
        key: string
    ) {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            });

            await this.s3Client.send(command);
            return { key, bucket: this.bucketName };
        }
        catch (error: any) {
            if (error.name === 'NoSuchBucket') {
                throw new Error(`Bucket ${this.bucketName} does not exist`);
            }
            if (error.name === 'AccessDenied') {
                throw new Error('No permission to upload to S3');
            }
            if (error.name === 'InvalidBucketName') {
                throw new Error('Invalid bucket name');
            }
            throw error;
        }
    };

    async deleteFile(key: string) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            await this.s3Client.send(command);
            return { key, bucket: this.bucketName };
        }
        catch (error: any) {
            if (error.name === 'NoSuchKey') {
                throw new Error(`Object with key ${key} not found`);
            }
            if (error.name === 'AccessDenied') {
                throw new Error('No permission to delete from S3');
            }
            throw error;
        }
    };

    getObjectUrl(key: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    };
}
