import * as Notifications from "expo-notifications";
export async function ensurePermissions(){ const s=await Notifications.getPermissionsAsync(); if(!s.granted) await Notifications.requestPermissionsAsync(); }
export async function scheduleLocal(title:string, body:string, seconds:number){ await ensurePermissions(); return Notifications.scheduleNotificationAsync({content:{title,body}, trigger:{seconds}}); }
