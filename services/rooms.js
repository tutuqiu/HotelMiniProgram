import {HTTPRequest} from '../utils/request.js'

const app=getApp();


export async function searchRoomById(id){
    const data ={
      id: id,
      checkInDate: app.globalData.checkInDate,
      checkOutDate: app.globalData.checkOutDate
    }
    const header={
      'content-type':'application/json'
    }

    try{
    const res = await HTTPRequest('GET',`/rooms/${id}`,data,header)
    console.log('searchRoomById')

    if(res.statusCode==200){
        const result = res.data
        console.log('成功获取房间详情:', result)

        return result
    }else{
        wx.showToast({
        title:res.data.message || `获取房间详情失败（code:${res.statusCode}）`,
        icon: 'none',
        duration: 2000
        })
        return null
    }
    }catch(err){
        console.error('获取房间详情异常:', err);
        wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
        return null
    }
}