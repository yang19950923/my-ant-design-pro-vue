import { axios } from '@/utils/request'
import { get,post,put,deleteAction} from '@/api/manage'

/**
 * 登录
 * @param {*} parameter 
 */
export function login(parameter) {
  return axios({
    url: '/login',
    method: 'post',
    data: parameter
  })
}

/**
 * 登出
 * @param {*} params 
 */
const logout = (params)=>post("/sysUser/logout",params)


/**
 * 根据部门ID加载有效用户
 * @param {*} params 
 */
const userList = (params)=>get("/sysUser/userList",params)
// 用户添加
const addUser = (params)=>post("/sysUser/add",params)
// 用户修改
const editUser = (params)=>put("/sysUser/edit",params)
// 重置密码
const resetPassword  = (params)=>post("/sysUser/resetPassword",params)

/**
 * 删除
 */
export function delete_(params) {
  return deleteAction("/sysUser/delete",params)
}

/**
* 批量删除
* @param {*} params 
*/
export function deleteBatch(params) {
  return deleteAction("/sysUser/deleteBatch",params)
}
// 唯一性检测
const checkIsOnly = (params)=>get("/sysUser/checkIsOnly",params)
// 查询用户的角色列表
const queryUserRole = (params)=>get("/sysUser/queryUserRole",params);

/**
 * 获取图片验证码
 * @param {*} params 
 */
export function getVerifyCode(params) {
  return get("/auth/imageVerifyCode",params)
}

// 分页查询用户
const chatPage = (params) => get("/sysUser/chatPage", params)

export {
  userList,
  addUser,
  editUser,
  checkIsOnly,
  queryUserRole,
  resetPassword,
  logout,
  chatPage
}

// 方法多种方式
//   1、
//       import { get,deleteAction,put,post} from '@/api/manage'
//       const queryTreeList = (params)=>get("/sys/permission/queryTreeList",params);
//       export {
//           queryTreeList,
//       }
//   2、
//       import { get,post} from '@/api/manage'
//       export function queryPermissionsByToken(params){
//           return get("/sysPermission/getUserPermissionByToken",params)
//       }
//   3、
//       export function login(parameter) {
//       return axios({
//           url: '/sysUser/login',
//           method: 'post',
//           data: parameter
//       })
//       }