import s3Client from '@/cloud/aws';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { File } from 'formidable';
import fs from 'fs';
import { generateS3ClientPublicUrl } from './helper';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const updateAvatarToAws = async (
  file: File,
  uniqueFileName: string,
  avatarId?: string
) => {
  if (avatarId) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_PUBLIC_BUCKET,
      Key: avatarId,
    });
    await s3Client.send(deleteCommand);
  }

  //const uniqueFileName = user._id + '-' + user.name + '.png';

  const putCommand = new PutObjectCommand({
    Bucket: process.env.AWS_PUBLIC_BUCKET,
    Key: uniqueFileName,
    Body: fs.readFileSync(file.filepath),
  });
  await s3Client.send(putCommand);

  return {
    id: uniqueFileName,
    url: generateS3ClientPublicUrl(
      process.env.AWS_PUBLIC_BUCKET!,
      uniqueFileName
    ),
  };
};
export const uploadBookToAws = async (
  filepath: string,
  uniqueFileName: string
) => {
  const putCommand = new PutObjectCommand({
    Bucket: process.env.AWS_PUBLIC_BUCKET,
    Key: uniqueFileName,
    Body: fs.readFileSync(filepath),
  });
  await s3Client.send(putCommand);

  return {
    id: uniqueFileName,
    url: generateS3ClientPublicUrl(
      process.env.AWS_PUBLIC_BUCKET!,
      uniqueFileName
    ),
  };
};
interface FileInfo {
  bucket: string;
  uniqueKey: string;
  contentType: string;
}

export const generateFileUploadUrl = async (
  client: S3Client,
  fileInfo: FileInfo
) => {
  const { bucket, uniqueKey, contentType } = fileInfo;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: uniqueKey,
    ContentType: contentType,
  });

  return await getSignedUrl(client, command);
};
