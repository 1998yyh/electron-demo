<script setup lang="ts">

import { ref } from "vue";
import { ModelChat } from "../../../../model/ModelChat";
import { useStore } from "../../../store/index";
import BarTop from "../../../Component/BarTop.vue";
import MessageItem from './MessageItem.vue'

const { messageStore } = useStore();

</script>
<template>
  <div class="MessageBord">
    <BarTop class="topBar" />
    <div class="MessageList">
      <MessageItem :data="item" v-for="item in messageStore.data" :key="item.id" />
    </div>
  </div>
</template>
<style scoped lang="scss">

.MessageBord {
  height: 100vh;
  display: flex;
  flex: 1;
  flex-direction: column;
}
.MessageList{
  height: calc(100vh - 25px);
  overflow:auto;

}
</style>

