<template>

  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改图片' : '创建图片'}}
    </h2>
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :picture="picture" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL 上传" force-render>
        <UrlPictureUpload :picture="picture" :onSuccess="onSuccess" />
      </a-tab-pane>
    </a-tabs>

    <a-form v-if="picture" layout="vertical" :model="pictureForm" @finish="handleSubmit">
      <a-form-item label="名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :rows="2"
          autoSize
          allowClear
          />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-select
          v-model:value="pictureForm.category"
          :options="categoryOptions"
          placeholder="请选择分类"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          :options="tagOptions"
          mode="tags"
          placeholder="请选择标签"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
      </a-form-item>
    </a-form>


  </div>




</template>

<script setup lang="ts">
import PictureUpload from "@/components/PictureUpload.vue";
import {onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {message} from "ant-design-vue";
import {editPictureUsingPost, getPictureVoByIdUsingGet, listPictureTagCategoryUsingGet} from "@/api/pictureController";
import UrlPictureUpload from "@/components/UrlPictureUpload.vue";

// 文件上传类型
const uploadType = ref<'file' | 'url'>('file')
const picture = ref<API.PictureVO>();
const pictureForm = reactive<API.PictureEditRequest>({})

// 回调函数赋值给对应引用
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
  pictureForm.id = newPicture.id
  pictureForm.tags = newPicture.tags
  pictureForm.category = newPicture.category
  pictureForm.introduction = newPicture.introduction
}

const router = useRouter()
const route = useRoute()

/**
 * 提交表单
 */
const handleSubmit = async (values: any) => {
  const pictureId = picture.value.id;
  if (!pictureId) {
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success("创建成功")
    // 跳转到图片详情页面
    router.push({
      path: `/picture/${pictureId}`
    })
  } else {
    message.error("创建失败, " + res.data.message)
  }
}

/**
 * 获取标签和分类选项
 */
const tagOptions = ref<string[]>();
const categoryOptions = ref<string[]>();
const getTagCatogoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉组件格式
    tagOptions.value = (res.data.data.tags ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error("加载选项失败，" + res.data.message)
  }
}

const getOldPicture = async () => {
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id: id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}

// 页面加载时调用
onMounted(() => {
  getTagCatogoryOptions()
})

onMounted(() => {
  getOldPicture()
})

</script>


<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}

</style>
