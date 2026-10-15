import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSiteStore = defineStore('site', () => {
  const site = ref({
    title: '光影笔记',
    author: '你的名字',
    bio: '记录光影，也记录时间。',
    avatar: 'https://picsum.photos/seed/avatar01/200/200',
  })

  return { site }
})
