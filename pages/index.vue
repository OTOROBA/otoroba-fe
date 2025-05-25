<script setup lang="ts">
import { ref, onMounted, watch, watchEffect, nextTick } from 'vue';
// LeafletのCSSはトップレベルでインポート
import 'leaflet/dist/leaflet.css';
// Leafletの型定義のみをトップレベルでインポート
import type {
  Map as LeafletMap,
  TileLayer,
  Marker,
  LatLngExpression,
  IconOptions,
} from 'leaflet';

// サンプル店舗データ
const stores = ref([
  { id: 1, name: '店舗A (東京タワー)', lat: 35.6585805, lng: 139.7454329 },
  {
    id: 2,
    name: '店舗B (渋谷スクランブル交差点)',
    lat: 35.6590986,
    lng: 139.7006691,
  },
  {
    id: 3,
    name: '店舗C (横浜ランドマークタワー)',
    lat: 35.4556712,
    lng: 139.6307205,
  },
]);

// 選択された店舗のID
const selectedStoreId = ref<number | null>(null);
// 選択された店舗オブジェクト
const selectedStore = ref<{
  id: number;
  name: string;
  lat: number;
  lng: number;
} | null>(null);

// Leafletモジュール自体はクライアントサイドで動的にインポート
let L: typeof import('leaflet') | null = null;
// Leafletのマップインスタンス
let map: LeafletMap | null = null;
// Leafletのマーカーインスタンス
let marker: Marker | null = null;
// 地図を表示するDOM要素の参照
const mapContainer = ref<HTMLElement | null>(null);

// デフォルトマーカーアイコンのオプション
const defaultIconOptions: IconOptions = {
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], // アイコンのサイズ [width, height]
  iconAnchor: [12, 41], // アイコンの先端が対応する地理的位置を指す点 [x, y] (左上から)
  popupAnchor: [1, -34], // ポップアップの先端が出る位置 [x, y] (iconAnchorからの相対位置)
  shadowSize: [41, 41], // 影のサイズ
};

// onMounted は L のロードのみに専念
onMounted(async () => {
  console.log('[KENTA_DEBUG] onMounted - Component mounted.');
  if (process.client) {
    console.log(
      '[KENTA_DEBUG] onMounted - process.client is true. Importing Leaflet.'
    );
    L = await import('leaflet');
    console.log('[KENTA_DEBUG] onMounted - Leaflet imported:', L);
  } else {
    console.log('[KENTA_DEBUG] onMounted - process.client is false.');
  }
});

// watchEffect を使って、L と mapContainer.value が揃ったら地図を初期化
watchEffect(() => {
  console.log('[KENTA_DEBUG] watchEffect triggered.');
  console.log('[KENTA_DEBUG] watchEffect - L:', L ? 'Loaded' : 'Not Loaded');
  console.log(
    '[KENTA_DEBUG] watchEffect - mapContainer.value:',
    mapContainer.value ? 'Available' : 'Not Available'
  );
  console.log(
    '[KENTA_DEBUG] watchEffect - map (before init):',
    map ? 'Initialized' : 'Not Initialized'
  );

  if (process.client && L && mapContainer.value && !map) {
    // mapがまだ初期化されていない場合のみ
    console.log('[KENTA_DEBUG] watchEffect - Conditions met, calling initMap.');
    initMap();
  } else if (!process.client) {
    console.log('[KENTA_DEBUG] watchEffect - Not on client.');
  } else if (!L) {
    console.log('[KENTA_DEBUG] watchEffect - L is not yet loaded.');
  } else if (!mapContainer.value) {
    console.log(
      '[KENTA_DEBUG] watchEffect - mapContainer.value is not yet available.'
    );
  } else if (map) {
    console.log('[KENTA_DEBUG] watchEffect - Map already initialized.');
  }
});

// 地図の初期化関数
const initMap = () => {
  console.log('[KENTA_DEBUG] initMap called.');
  // L と mapContainer.value のチェックは watchEffect で既に行われているが、念のためここでも確認
  if (L && mapContainer.value && !map) {
    const initialPosition: LatLngExpression = selectedStore.value
      ? [selectedStore.value.lat, selectedStore.value.lng]
      : [35.6895, 139.6917]; // デフォルトは東京駅あたり

    map = L.map(mapContainer.value).setView(initialPosition, 13);
    console.log('[KENTA_DEBUG] initMap - Map initialized. Instance:', map);

    L.tileLayer('https://tile.openstreetmap.jp/styles/maptiler-basic-ja/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    console.log('[KENTA_DEBUG] initMap - TileLayer added.');

    if (selectedStore.value) {
      console.log(
        '[KENTA_DEBUG] initMap - selectedStore has value, calling updateMapMarker.'
      );
      updateMapMarker(selectedStore.value);
    } else {
      console.log(
        '[KENTA_DEBUG] initMap - selectedStore is null, no initial marker.'
      );
    }

    // 地図のサイズが正しく認識されない場合への対策
    map.invalidateSize();
    console.log('[KENTA_DEBUG] initMap - map.invalidateSize() called.');
  } else {
    console.warn(
      '[KENTA_DEBUG] initMap - Conditions NOT MET or map already initialized.',
      'L exists:',
      !!L,
      'mapContainer exists:',
      !!mapContainer.value,
      'map already initialized:',
      !!map
    );
  }
};

// 地図上のマーカーを更新する関数
const updateMapMarker = (store: { name: string; lat: number; lng: number }) => {
  console.log('[KENTA_DEBUG] updateMapMarker called with:', store);
  if (L && map) {
    // L と map が利用可能であることを確認
    console.log('[KENTA_DEBUG] updateMapMarker - L and map are available.');
    const position: LatLngExpression = [store.lat, store.lng];
    map.setView(position, 15); // 選択された店舗にズームして中心を移動
    console.log(
      '[KENTA_DEBUG] updateMapMarker - map.setView called to:',
      position
    );

    // 既存のマーカーがあれば削除
    if (marker) {
      console.log('[KENTA_DEBUG] updateMapMarker - Removing existing marker.');
      marker.remove();
    }
    // 新しいマーカーを作成して追加
    const icon = L.icon(defaultIconOptions);
    marker = L.marker(position, { icon: icon })
      .addTo(map)
      .bindPopup(store.name)
      .openPopup(); // ポップアップを最初から開く
    console.log(
      '[KENTA_DEBUG] updateMapMarker - New marker added and popup opened at:',
      position
    );
  } else {
    console.error(
      '[KENTA_DEBUG] updateMapMarker - L or map is NOT available!',
      'L:',
      L ? 'Loaded' : 'Not Loaded',
      'map:',
      map ? 'Initialized' : 'Not Initialized'
    );
  }
};

// 店舗選択時の処理
const selectStore = (store: {
  id: number;
  name: string;
  lat: number;
  lng: number;
}) => {
  console.log('[KENTA_DEBUG] selectStore called with:', store);
  selectedStoreId.value = store.id;
  selectedStore.value = store;
  console.log('[KENTA_DEBUG] selectedStore.value is now:', selectedStore.value);
};

// selectedStore が変更されたら地図を更新
watch(selectedStore, (newStore, oldStore) => {
  console.log(
    '[KENTA_DEBUG] watch selectedStore triggered. New:',
    newStore,
    'Old:',
    oldStore
  );
  console.log(
    '[KENTA_DEBUG] watch - Map instance:',
    map ? 'Initialized' : 'Not Initialized'
  );
  console.log('[KENTA_DEBUG] watch - L instance:', L ? 'Loaded' : 'Not Loaded');
  if (newStore) {
    // mapが初期化されてからマーカーを更新する
    if (map) {
      updateMapMarker(newStore);
    } else {
      console.warn(
        '[KENTA_DEBUG] watch - Map not yet initialized when trying to update marker for newStore.'
      );
      // ここで map が初期化されるのを待つか、initMap 側で selectedStore を見てマーカーを出すようにする（現在はそうなっている）
    }
  } else if (map && marker) {
    // newStoreがnull（選択解除など）で、かつmapとmarkerが存在する場合
    console.log(
      '[KENTA_DEBUG] watch - Removing marker because newStore is null.'
    );
    marker.remove();
    marker = null;
  }
});
</script>

<template>
  <div class="container">
    <h1>店舗リストと地図</h1>
    <div class="content-wrapper">
      <div class="store-list">
        <h2>店舗一覧</h2>
        <ul>
          <li
            v-for="store in stores"
            :key="store.id"
            @click="selectStore(store)"
            :class="{ selected: store.id === selectedStoreId }"
          >
            {{ store.name }}
          </li>
        </ul>
      </div>
      <div class="map-area">
        <h2>地図</h2>
        <div v-if="L" ref="mapContainer" id="mapid"></div>
        <div v-else class="loading-map">地図をロード中...</div>
        <p v-if="selectedStore" class="selected-store-info">
          選択中: {{ selectedStore.name }} (緯度: {{ selectedStore.lat }}, 経度:
          {{ selectedStore.lng }})
        </p>
        <p v-else>店舗を選択してください。</p>
      </div>
    </div>
  </div>
</template>

<style>
.container {
  padding: 20px;
  font-family: sans-serif;
}

.content-wrapper {
  display: flex;
  gap: 20px; /* リストと地図の間隔 */
  flex-wrap: wrap; /* 画面幅が狭い場合に折り返す */
}

.store-list {
  width: 30%;
  min-width: 250px; /* 最小幅 */
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
  max-height: 450px; /* 地図の高さと合わせるなど調整 */
  overflow-y: auto; /* 店舗が多い場合にスクロール */
}

.store-list h2 {
  margin-top: 0;
  font-size: 1.2em;
  color: #333;
}

.store-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.store-list li {
  padding: 12px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.store-list li:last-child {
  border-bottom: none;
}

.store-list li:hover {
  background-color: #e9e9e9;
}

.store-list li.selected {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border-radius: 4px;
}

.map-area {
  width: calc(70% - 20px); /* gapを考慮 */
  min-width: 300px; /* 最小幅 */
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
}

.map-area h2 {
  margin-top: 0;
  font-size: 1.2em;
  color: #333;
}

#mapid {
  height: 400px; /* 地図の高さを指定 */
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading-map {
  height: 400px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.selected-store-info {
  margin-top: 10px;
  font-size: 0.9em;
  color: #555;
  background-color: #eef;
  padding: 8px;
  border-radius: 4px;
}

/* レスポンシブ対応の簡単な例 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  .store-list,
  .map-area {
    width: 100%;
  }
  .map-area {
    /* 画面幅が狭い場合、gapはflex-direction:columnで不要になるので調整 */
    width: calc(100% - 20px); /* paddingを考慮 */
    margin-left: auto; /* 中央寄せの意図があれば */
    margin-right: auto;
  }
}
</style>
