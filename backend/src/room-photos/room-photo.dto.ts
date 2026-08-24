import { IsString, IsOptional, Allow } from 'class-validator';

export class AddRoomPhotoRequestDto {
  @Allow()
  caption?: string;
};

export interface S3UploadResultDto {
  key: string;
  bucket: string;
};

export interface AddRoomPhotoRepoDto{
    roomId: string,
    objectKey: string
    sortOrder: number,
    caption? : string
};