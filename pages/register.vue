<template>
  <div>
    <h2>新規登録</h2>
    <form @submit.prevent="signUp">
      <div>
        <label for="email">メールアドレス:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div>
        <label for="password">パスワード:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">登録する</button>
    </form>
    <p v-if="errorMsg" style="color: red;">{{ errorMsg }}</p>
    <p v-if="successMsg" style="color: green;">{{ successMsg }}</p>
    <br />
    <NuxtLink to="/">トップページに戻る</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const signUp = async () => {
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    successMsg.value = '確認メールを送信しました。メール内のリンクから登録を完了してください。'
    errorMsg.value = null
  } catch (error: any) {
    errorMsg.value = error.message
    successMsg.value = null
  }
}
</script>