const baseUrl="http://47.114.86.161:8080/api";

const app=getApp();


function HTTPRequest(method,router,data,header){
  return new Promise((resolve,reject)=>{
    wx.showLoading({ title: '请求中...' });
    
    wx.request({
      url:baseUrl+router,
      method:method,
      data:data,
      header: header,
      success:(res)=>{
        console.log(`${method}请求成功：${res}`)// 调试用：打印完整返回结果
        resolve(res); 
      },
      fail:(err)=>{
        console.log(`${method}请求失败：${res}`); // 调试用：打印错误信息
        wx.showToast({ title: '请求失败', icon: 'none' }); // 给用户提示失败
        reject(err); // 把错误信息传递给Promise的reject
      },
      // 完成回调：无论成功/失败，最终都会执行（核心作用：关闭加载态）
      complete: () => {
        wx.hideLoading(); // 关闭之前显示的加载弹窗
      }
    })
  });
}

// async function getUserInfo(token){
//   try{
//     const data = {}
//     const header={
//       'Authorization':'Bearer ' + token
//     }
//     const res = await HTTPRequest('GET','/me',data,header)
//     console.log(res)

//     if(res.statusCode==200){
//       const info = res.data
//       console.log('获取信息成功:',info)

//       app.globalData.userInfo.avatarUrl=info.avatarUrl
//       app.globalData.userInfo.nickName=info.name 
//       app.globalData.userInfo.phont=info.phone

//     }else{
//       wx.showToast({
//         title:res.data.message || `获取信息失败（code:${res.statusCode}）`,
//         icon: 'none',
//         duration: 2000
//       })
//     }
//   }catch(err){
//     console.error('验证异常:', err);
//     wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
//   }
// }

export {HTTPRequest};