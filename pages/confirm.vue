<template>
  <div>認証処理中...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const supabase = useSupabaseClient();
const router = useRouter();

// onMountedフックを使うことで、この中の処理は
// 必ずブラウザ側（クライアントサイド）でページが表示された後に実行されます。
onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      router.push('/');
    }
  });
});
</script>
