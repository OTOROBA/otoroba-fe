<template>
  <div>認証処理中...</div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const router = useRouter()

watch(user, () => {
  if (user.value) {
    // ユーザーが取得できたらダッシュボードなどへリダイレクト
    router.push('/dashboard')
  } else {
    // 状況に応じてログインページなどへ
    // router.push('/login')
  }
}, { immediate: true }) // immediate: true で初期チェックも行う
</script>