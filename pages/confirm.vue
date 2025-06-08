<template>
  <div>認証処理中...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const user = useSupabaseUser()
const router = useRouter()

// onMountedフックを使うことで、この中の処理は
// 必ずブラウザ側（クライアントサイド）でページが表示された後に実行されます。
onMounted(() => {
  // ユーザーの状態を監視
  watch(user, (newUser) => {
    // ユーザー情報が取得できたら（セッションが確立されたら）
    if (newUser) {
      // ホームページへリダイレクト
      router.push('/')
    }
  }, { immediate: true }) // 監視開始と同時に初回チェックを実行
})
</script>