import s3Client from '@/cloud/aws';
import {
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { File } from 'formidable';
import fs from 'fs';

export const updateAvatarToAws = async (
  file: File,
  uniqueFileName: string,
  avatarId?: string
) => {
  const bucketName = 'letras-viajeras-data';
  if (avatarId) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: avatarId,
    });
    await s3Client.send(deleteCommand);
  }

  //const uniqueFileName = user._id + '-' + user.name + '.png';

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueFileName,
    Body: fs.readFileSync(file.filepath),
  });
  await s3Client.send(putCommand);

  return {
    id: uniqueFileName,
    url: `https://${bucketName}.s3.amazonaws.com/${uniqueFileName}`,
  };
};
