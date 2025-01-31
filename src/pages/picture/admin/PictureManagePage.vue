<template>
  <a-flex justify="space-between">
    <h2>图片管理</h2>
    <a-button type="primary" href="/picture/add_picture" target="_blank">+ 创建图片</a-button>
  </a-flex>
  <a-form layout="inline" :model="searchParams" @finish="doSearch">
    <a-form-item label="关键词" name="searchText">
      <a-input
        v-model:value="searchParams.searchText"
        placeholder="从名称和简介搜素"
        allow-clear
      />
    </a-form-item>
    <a-form-item label="类型" name="category">
      <a-input
        v-model:value="searchParams.category"
        placeholder="请输入类型" />
    </a-form-item>
    <a-form-item label="标签" name="tags">
      <a-select
        v-model:value="searchParams.tags"
        mode="tags"
        placeholder="请输入标签"
        style="min-width: 180px"
        allow-clear
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">搜索</a-button>
    </a-form-item>
  </a-form>

  <a-table :columns="columns"
           :data-source="dataList"
           :pagination="pagination"
           @change="doTableChange">
    <template #headerCell="{ column }">
      <template v-if="column.dataIndex === 'id'">
        <span>
          <smile-outlined />
          ID
        </span>
      </template>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'url'">
        <a-image :src="record.url" :width="120" />
      </template>
      <!--  标签   -->
      <template v-else-if="column.dataIndex === 'tags'">
        <a-space wrap>
          <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
        </a-space>
      </template>
      <!--  图片信息   -->
      <template v-else-if="column.dataIndex === 'picInfo'">
        <div>格式： {{ record.picFormat }}</div>
        <div>宽度： {{ record.picWidth }}</div>
        <div>高度： {{ record.picHeight }}</div>
        <div>宽高比： {{ record.picScale }}</div>
        <div>大小： {{ (record.picSize / 1024).toFixed(2) }}KB</div>
      </template>
      <template v-else-if="column.dataIndex === 'createTime'">
        {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-else-if="column.dataIndex === 'editTime'">
        {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-else-if="column.key === 'action'">
        <a-button type="link" :href="`/picture/add_picture?id=${record.id}`" target="_blank">编辑</a-button>
        <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
      </template>
    </template>
  </a-table>
</template>
<script lang="ts" setup>
import {SmileOutlined} from '@ant-design/icons-vue';
import {computed, onMounted, reactive, ref} from "vue";
import {message} from "ant-design-vue";
import dayjs from "dayjs";
import {deletePictureUsingPost, listPictureByPageUsingPost} from "@/api/pictureController";

const columns = [
  {
    name: 'ID',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
];

// 数据
const dataList = ref<any>([])
const total = ref<number>(0)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend'
})


// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error("获取数据失败，" + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 分页参数
// 动态变化的参数，使用computed计算属性，在searchParams改变时同步改变
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

// 表格变化处理
// 用户切换页号、页面大小时触发change事件绑定该函数
// 更新searchParams搜索条件，并触发搜索
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 点击搜索数据需要重置页码
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success("删除成功")
    // 刷新数据
    fetchData()
  } else {
    message.error("删除失败")
  }
}

</script>

