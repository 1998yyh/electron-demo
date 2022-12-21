<script setup lang="ts">
import { ref } from "vue";
import { useStore } from "../../../store/index";
import BarTop from "../../../Component/BarTop.vue";

const { chatStore: store } = useStore();

let logInfo = ref("");
let curId = "";

// 订阅srore内数据变化
store.$subscribe((mutations, state) => {
  let item = state.data.find((v) => v.isSelected);
  let id = item?.id as string;
  if (id != curId) {
    logInfo.value = `现在应该加载ID为${item?.id}的聊天记录`;
    curId = id;
  }
});
</script>
<template>
  <div class="MessageBord">
    <BarTop />
    <div class="MessageList">{{ logInfo }}</div>
  </div>
</template>
<style scoped lang="scss">
.MessageBord {
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
}
</style>
