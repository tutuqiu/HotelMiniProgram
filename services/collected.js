import {HTTPRequest} from '../utils/request.js'
const app=getApp();

export async function updateCollectedList(id){
  const header={
    'Authorization':'Bearer ' + app.getToken()
  }
  try{
    const res = await HTTPRequest('POST',`/rooms/${id}/favorite`,{},header)
    console.log('update collected res:',res)

    if(res.statusCode==200){
      const collectedList = res.data.favoriteRooms
      console.log('collectedList:',collectedList)

      app.globalData.userInfo.collectedList=collectedList
    }else{
      wx.showToast({
        title:res.data.message || `更新收藏房间失败（code:${res.statusCode}）`,
        icon: 'none',
        duration: 2000
      })
    }
  }catch(err){
    console.error('更新收藏房间异常:', err);
    wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
  }
};