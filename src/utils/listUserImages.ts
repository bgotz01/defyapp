//src/utils/listUserImages.ts

import s3 from '../../awsconfig';

const listUserImages = async (userId: string): Promise<string[]> => {
  const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('Bucket name is not defined in environment variables');
  }

  const params = {
    Bucket: bucketName,
    Prefix: `${userId}/`,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    if (!data.Contents) {
      return [];
    }
    const imageUrls = data.Contents.map(item => `https://${bucketName}.s3.${s3.config.region}.amazonaws.com/${item.Key}`);
    return imageUrls;
  } catch (error) {
    console.error('Error fetching images from S3:', error);
    throw new Error('Could not fetch images');
  }
};

export default listUserImages;
