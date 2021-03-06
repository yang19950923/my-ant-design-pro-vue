<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :width="drawerWidth"
    placement="right"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label="登录账号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            placeholder="请输入登录账号"
            v-decorator="[ 'loginName', validatorRules.loginName]"
            :readOnly="!!model.sysUserId"
          />
        </a-form-item>

        <a-form-item label="用户名字" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            placeholder="请输入用户名称"
            v-decorator="[ 'userName', {
            rules: [{required: true, message: '请填写用户名称'}]
          }]"
          />
        </a-form-item>

        <a-form-item label="身份证号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入身份证号" v-decorator="[ 'idCard',validatorRules.idCard]" />
        </a-form-item>

        <a-form-item label="头像" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            name="file"
            listType="picture-card"
            :showUploadList="false"
            :action="appApi"
            :beforeUpload="validImg"
            @change="handleChangeBaseImg"
          >
            <img v-if="imgUrl" :src="imgUrl" alt="头像" style="width: 100px;height: 100px" />
            <div v-else>
              <a-icon :type="uploading ? 'loading' : 'plus'" />
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item label="职务" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            mode="multiple"
            style="width: 100%"
            placeholder="请选择职务"
            optionFilterProp="children"
             v-model="selectedJob"
          >
            <a-select-option value>请选择职务</a-select-option>
            <a-select-option
              v-for="(dict) in dictList"
              :key="dict.value"
              :value="dict.value"
            >{{ dict.job }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="联系方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入手机号码" v-decorator="[ 'phone',validatorRules.phone]" />
        </a-form-item>

        <a-form-item label="住址" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入详细地址" v-decorator="[ 'address']" />
        </a-form-item>
        <a-form-item label="角色分配" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            mode="multiple"
            style="width: 100%"
            placeholder="请选择用户角色"
            optionFilterProp="children"
            v-model="selectedRole"
          >
            <a-select-option
              v-for="(role,roleindex) in roleList"
              :key="roleindex.toString()"
              :value="role.sysRoleId"
            >{{ role.roleName }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="邮箱" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入邮箱" v-decorator="[ 'email', validatorRules.email]" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态">
          <a-radio-group buttonStyle="solid" v-decorator="[ 'state', {'initialValue':0}]">
            <a-radio-button :value="0">正常</a-radio-button>
            <a-radio-button :value="1">冻结</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number
            :min="1"
            v-decorator="['sort',{'initialValue':100}]"
            style="width:100%"
            placeholder="请输入序号"
          />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
          <a-textarea placeholder="请输入备注" v-decorator="['remark', {}]" />
        </a-form-item>
      </a-form>
    </a-spin>

    <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="确定放弃编辑？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleSubmit" type="primary" :loading="confirmLoading">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
import pick from 'lodash.pick'
import moment from 'moment'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { get } from '@/api/manage'
import { addUser, editUser, checkIsOnly, queryUserRole } from '@/api/user'
import { roleList } from '@/api/role'
import { dictList } from '@/api/dict'

export default {
  name: 'UserModal',
  data() {
    return {
      modalWidth: 800,
      drawerWidth: 700,
      modaltoggleFlag: true,
      confirmDirty: false,
      disableSubmit: false,
      dateFormat: 'YYYY-MM-DD',
      title: '操作',
      visible: false,
      model: {},
      roleList: [],
      dictList:[],
      selectedRole: [],
      selectedJob:[],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      currentDeptId: '',
      confirmLoading: false,
      headers: {},
      uploading: false,
      form: this.$form.createForm(this),
      appApi: process.env.VUE_APP_API + '/upload/img/',
      imgUrl: '',
      headImg: '',
      validatorRules: {
        loginName: {
          rules: [
            {
              required: true,
              message: '请输入登录账号!'
            },
            {
              validator: this.validateLoginName
            }
          ]
        },
        realname: { rules: [{ required: true, message: '请输入用户名称!' }] },
        phone: {
          rules: [
            {
              required: true,
              message: '请输入手机号码!'
            },
            { validator: this.validatePhone }
          ]
        },
        idCard: {
          rules: [
            {
              required: true,
              message: '请输入身份证号!'
            },
            { validator: this.validateIdCard }
          ]
        },
        email: {
          rules: [
            {
              validator: this.validateEmail
            }
          ]
        }
      }
    }
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
  },
  methods: {
    // 调用add方法
    add() {
      this.refresh()
      this.edit({ activitiSync: '1' })
    },
    // 调用edit
    edit(record) {
      this.resetScreenSize()
      let that = this
      that.initialRoleList()
      that.initialJobDictList()
      that.form.resetFields()
      if (record.hasOwnProperty('sysUserId')) {
        that.loadUserRoles(record.sysUserId)
      }
      that.userId = record.sysUserId
      that.imgUrl = process.env.VUE_APP_IMG + record.headImg
      that.headImg = record.headImg
      that.visible = true
      that.model = Object.assign({}, record)
      if(this.model.jobs){
        this.selectedJob = this.model.jobs.split(",")
      }
      that.$nextTick(() => {
        that.form.setFieldsValue(
          pick(this.model, 'loginName', 'userName', 'email','address', 'idCard', 'phone', 'sort', 'state', 'remark')
        )
      })
    },
    // 验证登录账号
    validateLoginName(rule, value, callback) {
      if (value && !new RegExp(/^[A-Za-z0-9]{5,}$/).test(value)) {
        callback(new Error('登录密码只能输入英文或数字且不能少于5位数!'))
      } else if (!this.userId) {
        var params = {
          loginName: value
        }
        checkIsOnly(params).then(res => {
          if (res.code === 200) {
            callback()
          } else {
            callback(res.msg || '登录账号已存在!')
          }
        })
      } else {
        callback()
      }
    },
    // 验证邮箱
    validateEmail(rule, value, callback) {
      if (!value) {
        callback()
      } else {
        if (
          new RegExp(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ).test(value)
        ) {
          callback()
        } else {
          callback(new Error('请输入正确格式的邮箱!'))
        }
      }
    },
    // 验证手机号
    validatePhone(rule, value, callback) {
      if (!value || new RegExp(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/).test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确格式的手机号码!'))
      }
    },
    // 验证身份证号
    validateIdCard(rule, value, callback) {
      if (!value || new RegExp(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确格式的身份证号!'))
      }
    },
    // form 表单提交
    handleSubmit() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          if (!values.birthday) {
            values.birthday = ''
          } else {
            values.birthday = values.birthday.format(this.dateFormat)
          }
          let formData = Object.assign(this.model, values)
          formData.departId = this.currentDeptId
          formData.selectedroles = this.selectedRole.length > 0 ? this.selectedRole.join(',') : ''
          formData.jobs = this.selectedJob.length > 0 ? this.selectedJob.join(',') : '' 
          formData.headImg = this.headImg
          let obj
          if (!this.model.sysUserId) {
            obj = addUser(formData)
          } else {
            obj = editUser(formData)
          }
          obj
            .then(res => {
              if (res.code === 200) {
                that.$message.success('操作成功!')
                that.$emit('ok')
              } else {
                that.$message.warning('操作失败!')
              }
            })
            .finally(() => {
              that.confirmLoading = false
              that.checkedDepartNames = []
              that.close()
            })
        }
      })
    },
    // 修改时查询用户拥有角色
    loadUserRoles(sysUserId) {
      queryUserRole({ sysUserId: sysUserId }).then(res => {
        if (res.code === 200) {
          this.selectedRole = res.data
        } else {
          that.$message.warning(res.msg || '用户角色加载失败！')
        }
      })
    },
    //查询所有角色
    initialRoleList() {
      roleList().then(res => {
        if (res.code === 200) {
          this.roleList = res.data
        } else {
        }
      })
    },
    async initialJobDictList() {
      let that = this
      let obj = {
        skey: '用户管理>用户职务',
        mode: '1'
      }
      await dictList(obj).then(res => {
        if (res.code === 200) {
            that.dictList = [];
            res.data.forEach((item) => {
            that.dictList.push({
              value: item.sysDictId,
              job: item.name
            })
          });
        } else {
        }
      })
    },
    refresh() {
      this.selectedDepartKeys = []
      this.checkedDepartKeys = []
      this.checkedDepartNames = []
      this.checkedDepartNameString = ''
    },

    close() {
      this.$emit('close')
      this.visible = false
      this.disableSubmit = false
      this.selectedRole = []
      this.checkedDepartNames = []
      this.checkedDepartNameString = ''
      this.checkedDepartKeys = []
      this.selectedDepartKeys = []
    },
    moment,
    handleCancel() {
      this.close()
    },
    handleConfirmBlur(e) {
      const value = e.target.value
      this.confirmDirty = this.confirmDirty || !!value
    },
    validImg(file) {
      let size = file.size;
      let limitSize = size / 1024 / 1024;
      if (limitSize > 5) {
        this.$message.warning('请上传少于5M的图片!');
        return false;
      }
    },
    handleChangeBaseImg(info) {
      if (info.file.status === 'uploading') {
        this.uploading = true;
        return;
      }
      if (info.file.status === 'done') {
        this.imgUrl = process.env.VUE_APP_IMG + info.file.response.data;
        this.headImg = info.file.response.data;
        this.uploading = false;
      }
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.drawerWidth = screenWidth
      } else {
        this.drawerWidth = 700
      }
    }
  }
}
</script>

<style scoped>
.avatar-uploader > .ant-upload {
  width: 104px;
  height: 104px;
}
.ant-upload-select-picture-card i {
  font-size: 49px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.ant-table-tbody .ant-table-row td {
  padding-top: 10px;
  padding-bottom: 10px;
}

.drawer-bootom-button {
  position: absolute;
  bottom: -8px;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
}
</style>