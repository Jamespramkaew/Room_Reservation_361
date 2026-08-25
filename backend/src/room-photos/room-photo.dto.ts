import { IsString, IsInt, IsOptional, Allow } from 'class-validator';

// Add Room Photo
export class AddRoomPhotoRequestDto {
  @Allow()
  caption?: string;
};

export interface S3UploadResultDto {
  key: string;
  bucket: string;
};

export interface AddRoomPhotoRepoDto {
  roomId: string,
  objectKey: string
  sortOrder: number,
  caption?: string
};


// Update Room Photo

export class UpdateRoomPhotoRequestDto {

  @IsInt({ message: "sortOrder must be an integer" })
  @IsOptional()
  sortOrder: number

  @IsString({ message: "caption muse be a string" })
  @IsOptional()
  caption: string

};

export interface UpdateRoomPhotoRepoDto {
  roomPhotoId: string,
  sortOrder?: number,
  caption?: string
};

