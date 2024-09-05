import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import GameView from "../views/GameView.vue";
import RoomView from "../views/RoomView.vue";
import PlayOfflineView from "../views/PlayOfflineView.vue";
import JoinRoomView from "../views/JoinRoomView.vue";
import OptionsView from "../views/OptionsView.vue";
import HowToPlayView from "../views/HowToPlayView.vue";
import ShopView from "../views/ShopView.vue";
import ProfileView from "../views/ProfileView.vue";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/game", name: "Game", component: GameView },
  { path: "/room", name: "Room", component: RoomView },
  { path: "/play-offline", name: "PlayOffline", component: PlayOfflineView },
  { path: "/join-room", name: "JoinRoom", component: JoinRoomView },
  { path: "/options", name: "Options", component: OptionsView },
  { path: "/how-to-play", name: "HowToPlay", component: HowToPlayView },
  { path: "/shop", name: "Shop", component: ShopView },
  { path: "/profile", name: "Profile", component: ProfileView },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
