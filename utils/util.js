const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 将小程序的API封装成支持Promise的API
 * @params fn {Function} 小程序原始API，如wx.login
 */
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}

const calDayCount=(checkInDate,checkOutDate)=>{
  const start=new Date(checkInDate)
  const end =new Date(checkOutDate)

  start.setHours(0,0,0,0)
  end.setHours(0,0,0,0)

  const msCount=end.getTime()-start.getTime()
  const dayCount=Math.floor(msCount/(24*60*60*1000))

  return dayCount
}

export{
  formatTime,wxPromisify,calDayCount
}
