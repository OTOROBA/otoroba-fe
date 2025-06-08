<template>
  <div>
    <h2>ログイン</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">メールアドレス:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div>
        <label for="password">パスワード:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">ログイン</button>
    </form>
    <p v-if="errorMsg" style="color: red;">{{ errorMsg }}</p>
    <br />
    <NuxtLink to="/">トップページに戻る</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()
const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)

const login = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    // ★ログイン成功後、トップページに移動
    await router.push('/')
  } catch (error: any) {
    errorMsg.value = 'メールアドレスまたはパスワードが違います。'
  }
}
</script>