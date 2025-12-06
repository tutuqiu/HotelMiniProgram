const baseUrl="http://47.114.86.161:8080/api";

function loginPost(code){
  const url="/public/auth/wx/login"

  return new Promise((resolve,reject)=>{
    wx.showLoading({ title: '登录中...' });
    
    wx.request({
      url:baseUrl+url,
      method:'POST',
      data:{
        "code":code,
      },
      header: {
        'content-type': 'application/json',
      },
      success:(res)=>{
        console.log('POST请求成功:', res); // 调试用：打印完整返回结果
        resolve(res.data); // 把后端返回的核心数据（res.data）传递给Promise的resolve
      },
      fail:(err)=>{
        console.error('POST请求失败：', err); // 调试用：打印错误信息
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


export {loginPost};