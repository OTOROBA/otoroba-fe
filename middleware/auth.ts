// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // 未認証で、かつ認証が必要なページにアクセスしようとした場合
  // to.path !== '/login' などを追加して無限ループを避ける
  if (!user.value && to.meta.requiresAuth) {
    // nuxt.config.ts の redirectOptions.login があればそちらが使われることも
    return navigateTo('/login')
  }
})