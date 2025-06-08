<template>
  <div class="login-page">
    <div class="login-container">
      <h2>ログイン</h2>

      <form @submit.prevent="loginWithEmail">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">パスワード</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        <button type="submit" class="button-primary">メールアドレスでログイン</button>
      </form>

      <div class="divider">
        <span>または</span>
      </div>

      <div class="social-login">
        <button @click="loginWithSocial('google')" class="social-button google">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.508,44,30.026,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
          Googleでログイン
        </button>
        <button @click="loginWithSocial('twitter')" class="social-button x">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26l8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
          Xでログイン
        </button>
      </div>

      <div class="links">
        <NuxtLink to="/register">アカウントをお持ちでないですか？ 新規登録</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()
const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)

// 1. メールアドレスでのログイン関数
const loginWithEmail = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    await router.push('/')
  } catch (error: any) {
    errorMsg.value = 'メールアドレスまたはパスワードが違います。'
  }
}

// 2. ソーシャルログイン用の共通関数
const loginWithSocial = async (provider: 'google' | 'twitter') => {
  // エラーメッセージをリセット
  errorMsg.value = null

  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider,
  });

  if (error) {
    console.error(`${provider}でのログイン中にエラーが発生しました`, error)
    errorMsg.value = `${provider}でのログインに失敗しました。`
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #f7fafc;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
  color: #2d3748;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
}

.button-primary {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: #4299e1;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button-primary:hover {
  background-color: #3182ce;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: #a0aec0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 16px;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  background-color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.social-button:hover {
  background-color: #f7fafc;
}

.social-button svg {
  margin-right: 12px;
}

.error-text {
  color: #e53e3e;
  margin-bottom: 16px;
  text-align: center;
}

.links {
  margin-top: 24px;
  text-align: center;
}

.links a {
  color: #4299e1;
  text-decoration: none;
}
</style>