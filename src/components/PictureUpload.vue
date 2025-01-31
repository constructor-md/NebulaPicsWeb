<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      :custom-request="handleUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击拖拽或上传图片</div>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { UploadChangeParam, UploadProps } from 'ant-design-vue';
import {uploadPictureUsingPost} from "@/api/pictureController";
interface Props {
  picture?: API.PictureVO,
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()


function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
}

const fileList = ref([]);
const loading = ref<boolean>(false);
const imageUrl = ref<string>('');

const handleUpload = async ({ file }: any) => {
  // 上传处理开始，展示loading条
  loading.value = true;
  try {
    // 如果pictureId存在，表示需要后端更新，则需要传递pictureId
    const params = props.picture ? { id: props.picture.id } : {};
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      message.success("图片上传成功")
      // 上传成功的图片传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error("图片上传失败，" + res.data.message)
    }
  } catch (error) {
    message.error("图片上传失败")
  } finally {
    // 上传操作结束，解除loading条
    loading.value = false
  }
}

// 上传前校验
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐jpg或png');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('不能上传超过 2M 的图片');
  }
  return isJpgOrPng && isLt2M;
};

</script>
<style scoped>
.picture-upload :deep(.ant-upload){
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}
.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
