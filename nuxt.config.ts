// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    // オプション:
    // redirect: true, // OAuth認証後のリダイレクトを自動処理 (デフォルト true)
    redirectOptions: { // リダイレクトに関するオプション
      login: '/login',         // 未認証時にリダイレクトされるページ
      callback: '/confirm',    // OAuth認証後のコールバック処理を行うページ
      exclude: ['/register'],  // リダイレクト保護から除外するパス (正規表現も可)
    },
    // clientOptions: { // Supabase JS Client のオプション
    //   auth: {
    //     flowType: 'pkce',
    //     detectSessionInUrl: true,
    //     persistSession: true,
    //     autoRefreshToken: true
    //   },
    // }
  },
  devtools: { enabled: true } // Nuxt Devtools (任意)
})