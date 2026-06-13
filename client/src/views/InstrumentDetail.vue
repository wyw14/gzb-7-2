<template>
  <div class="instrument-detail" v-if="instrument">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/instruments' }">乐器市场</el-breadcrumb-item>
        <el-breadcrumb-item>{{ instrument.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="detail-grid">
        <div class="image-section card">
          <img :src="instrument.image" :alt="instrument.name" class="main-image" />
          <div class="image-tags">
            <span class="badge badge-primary">{{ instrument.category }}</span>
            <span class="badge badge-success">{{ instrument.condition }}</span>
            <span class="badge" :class="instrument.status === 'available' ? 'badge-success' : 'badge-warning'">
              {{ instrument.status === 'available' ? '可借用' : '借用中' }}
            </span>
          </div>
        </div>
        
        <div class="info-section">
          <div class="info-card card mb-20">
            <h1 class="inst-name">{{ instrument.name }}</h1>
            <div class="info-meta">
              <span><el-icon><Goods /></el-icon> {{ instrument.brand }} {{ instrument.model }}</span>
              <span><el-icon><Medal /></el-icon> {{ instrument.level }}</span>
              <span><el-icon><Location /></el-icon> {{ instrument.location }}</span>
              <span v-if="instrument.distance !== undefined" class="highlight">
                距你 {{ instrument.distance }}km
              </span>
            </div>
            
            <div class="price-block">
              <div class="daily-fee">
                <span class="currency">¥</span>
                <span class="num">{{ instrument.dailyFee }}</span>
                <span class="unit">/天</span>
              </div>
              <div class="fee-info">
                <div>押金 <b>¥{{ instrument.deposit }}</b></div>
                <div>参考价值 <b>¥{{ instrument.value }}</b></div>
              </div>
            </div>
            
            <div class="action-row">
              <el-button type="primary" size="large" :disabled="instrument.status !== 'available' || isOwner" @click="showBorrow = true">
                <el-icon><Wallet /></el-icon>
                {{ isOwner ? '这是您发布的乐器' : instrument.status === 'available' ? '申请借用' : '暂不可借' }}
              </el-button>
              <el-button size="large" :disabled="isOwner" @click="showInvite = true">
                <el-icon><ChatDotRound /></el-icon>
                邀约主人练琴
              </el-button>
            </div>
          </div>
          
          <div class="desc-card card mb-20">
            <h3><el-icon><Document /></el-icon> 乐器描述</h3>
            <p>{{ instrument.description }}</p>
            
            <h4 class="mt-20">可借用时间</h4>
            <div class="tags">
              <span class="tag tag-time" v-for="t in instrument.availableTimes" :key="t">{{ t }}</span>
            </div>
          </div>
          
          <div class="owner-card card" v-if="instrument.owner">
            <h3><el-icon><User /></el-icon> 乐器主人</h3>
            <div class="owner-row">
              <router-link :to="`/buddies/${instrument.owner.id}`" class="owner-info">
                <img :src="instrument.owner.avatar" class="avatar-lg" />
                <div class="owner-detail">
                  <div class="owner-name">{{ instrument.owner.username }}</div>
                  <div class="owner-level">
                    <span class="badge badge-primary">{{ instrument.owner.skillLevel }}</span>
                    <span class="rating">
                      <el-icon><Star /></el-icon>
                      {{ instrument.owner.rating }} ({{ instrument.owner.reviewCount }}评价)
                    </span>
                  </div>
                  <div class="owner-bio">{{ instrument.owner.bio }}</div>
                </div>
              </router-link>
              <div class="owner-actions">
                <router-link :to="`/buddies/${instrument.owner.id}`">
                  <el-button>查看主页</el-button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section-card card" v-if="ownerReviews.length">
        <h3><el-icon><ChatLineSquare /></el-icon> 主人的评价 ({{ ownerReviews.length }})</h3>
        <div class="review-list">
          <div class="review-item" v-for="r in ownerReviews" :key="r.id">
            <img :src="r.reviewer?.avatar" class="avatar-sm" />
            <div class="review-content">
              <div class="review-header">
                <span class="reviewer">{{ r.reviewer?.username }}</span>
                <el-rate v-model="r.rating" disabled size="small" />
                <span class="badge badge-primary">{{ r.context }}</span>
              </div>
              <p class="review-text">{{ r.content }}</p>
              <span class="review-time">{{ new Date(r.createdAt).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section-card card mt-20">
        <div class="section-header-row">
          <h3><el-icon><SetUp /></el-icon> 保养档案</h3>
          <el-button v-if="isOwner" type="primary" size="small" @click="showMaintenance = true">
            <el-icon><Plus /></el-icon> 添加保养记录
          </el-button>
        </div>
        
        <div v-if="maintenances.length === 0" class="empty-maintain">
          <p>暂无保养记录</p>
        </div>
        
        <div v-else class="maintain-list">
          <div class="maintain-item" v-for="m in maintenances" :key="m.id">
            <div class="maintain-left">
              <span class="maintain-type-badge" :class="typeBadgeClass(m.type)">{{ m.type }}</span>
            </div>
            <div class="maintain-right">
              <div class="maintain-top">
                <span class="maintain-date">{{ m.date }}</span>
                <span class="maintain-cost" v-if="m.cost">花费 ¥{{ m.cost }}</span>
                <el-button
                  v-if="isOwner"
                  type="danger"
                  size="small"
                  text
                  @click="deleteMaintenance(m.id)"
                >删除</el-button>
              </div>
              <p class="maintain-desc">{{ m.description }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="maintenances.length > 0 && !isOwner" class="maintain-tip">
          <el-icon><InfoFilled /></el-icon>
          查看保养记录可帮助您判断乐器状态，决定是否适合长期借用
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showBorrow" title="申请借用" width="500px">
      <el-form :model="borrowForm" label-width="90px">
        <el-form-item label="乐器">
          <span>{{ instrument.name }}</span>
        </el-form-item>
        <el-form-item label="借用日期">
          <el-date-picker
            v-model="borrowForm.dates"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="借用目的">
          <el-input v-model="borrowForm.purpose" type="textarea" :rows="3" placeholder="请描述借用目的，如：练习演出曲目等" />
        </el-form-item>
        <el-form-item label="费用预估">
          <span class="text-danger">押金 ¥{{ instrument.deposit }} + 租金 ¥{{ estimatedFee }} = 共 ¥{{ instrument.deposit + estimatedFee }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBorrow = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitBorrow">提交申请</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showInvite" title="邀约练琴" width="500px">
      <el-form :model="inviteForm" label-width="90px">
        <el-form-item label="想练乐器">
          <el-input v-model="inviteForm.instrument" placeholder="如：古典吉他二重奏" />
        </el-form-item>
        <el-form-item label="想练曲目">
          <el-input v-model="inviteForm.piece" placeholder="如：爱的罗曼史" />
        </el-form-item>
        <el-form-item label="约练时间">
          <el-date-picker
            v-model="inviteForm.meetTime"
            type="datetime"
            placeholder="选择约练时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="约练地点">
          <el-input v-model="inviteForm.location" placeholder="建议选公共空间：咖啡馆/音乐教室等" />
        </el-form-item>
        <el-form-item label="留言">
          <el-input v-model="inviteForm.message" type="textarea" :rows="3" placeholder="想说点什么..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInvite = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitInvite">发送邀约</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showMaintenance" title="添加保养记录" width="500px">
      <el-form :model="maintenanceForm" label-width="90px">
        <el-form-item label="保养类型">
          <el-select v-model="maintenanceForm.type" placeholder="请选择保养类型" style="width: 100%">
            <el-option label="换弦" value="换弦" />
            <el-option label="调音" value="调音" />
            <el-option label="维修" value="维修" />
            <el-option label="清洁" value="清洁" />
            <el-option label="配件更换" value="配件更换" />
          </el-select>
        </el-form-item>
        <el-form-item label="保养日期">
          <el-date-picker
            v-model="maintenanceForm.date"
            type="date"
            placeholder="选择保养日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="花费金额">
          <el-input-number v-model="maintenanceForm.cost" :min="0" :precision="0" placeholder="花费金额（元）" style="width: 100%" />
        </el-form-item>
        <el-form-item label="保养描述">
          <el-input v-model="maintenanceForm.description" type="textarea" :rows="3" placeholder="请描述保养详情，如：更换了什么弦、调了哪些音等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMaintenance = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitMaintenance">提交记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { instrumentApi, borrowApi, invitationApi, reviewApi, maintenanceApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Goods, Medal, Location, Wallet, ChatDotRound, Document, User, Star, ChatLineSquare, SetUp, Plus, InfoFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const requireLogin = inject('requireLogin', () => router.push('/login'))

const instrument = ref(null)
const ownerReviews = ref([])
const maintenances = ref([])
const showBorrow = ref(false)
const showInvite = ref(false)
const showMaintenance = ref(false)
const submitting = ref(false)

const borrowForm = reactive({
  dates: null,
  purpose: ''
})

const inviteForm = reactive({
  instrument: '',
  piece: '',
  meetTime: null,
  location: '',
  message: ''
})

const maintenanceForm = reactive({
  type: '',
  date: null,
  cost: 0,
  description: ''
})

const isOwner = computed(() => userStore.userId === instrument.value?.ownerId)

const estimatedFee = computed(() => {
  if (!borrowForm.dates || !instrument.value) return 0
  const days = Math.ceil((borrowForm.dates[1] - borrowForm.dates[0]) / (1000 * 60 * 60 * 24)) + 1
  return days * instrument.value.dailyFee
})

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

onMounted(async () => {
  try {
    instrument.value = await instrumentApi.get(route.params.id)
    inviteForm.value.instrument = instrument.value.category
    
    ownerReviews.value = await reviewApi.list({ revieweeId: instrument.value.ownerId, targetType: 'user' })
    
    await loadMaintenances()
  } catch (e) {
    ElMessage.error('加载失败')
  }
})

const loadMaintenances = async () => {
  try {
    const all = await maintenanceApi.list({ instrumentId: instrument.value.id })
    maintenances.value = all
  } catch (e) {
    console.error('加载保养记录失败', e)
    ElMessage.error('保养记录加载失败')
  }
}

const typeBadgeClass = (type) => {
  const map = {
    '换弦': 'badge-change-string',
    '调音': 'badge-tuning',
    '维修': 'badge-repair',
    '清洁': 'badge-clean',
    '配件更换': 'badge-accessory'
  }
  return map[type] || ''
}

const submitMaintenance = async () => {
  if (!userStore.isLoggedIn) {
    showMaintenance.value = false
    requireLogin()
    return
  }
  if (!isOwner.value) {
    ElMessage.warning('只有乐器主人才能添加保养记录')
    return
  }
  if (!maintenanceForm.type) {
    ElMessage.warning('请选择保养类型')
    return
  }
  if (!maintenanceForm.date) {
    ElMessage.warning('请选择保养日期')
    return
  }
  submitting.value = true
  try {
    await maintenanceApi.create({
      instrumentId: instrument.value.id,
      type: maintenanceForm.type,
      date: new Date(maintenanceForm.date).toISOString().split('T')[0],
      cost: maintenanceForm.cost,
      description: maintenanceForm.description
    })
    ElMessage.success('保养记录已添加')
    showMaintenance.value = false
    maintenanceForm.type = ''
    maintenanceForm.date = null
    maintenanceForm.cost = 0
    maintenanceForm.description = ''
    loadMaintenances()
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || '添加失败')
  } finally {
    submitting.value = false
  }
}

const deleteMaintenance = async (id) => {
  if (!userStore.isLoggedIn) {
    requireLogin()
    return
  }
  if (!isOwner.value) {
    ElMessage.warning('只有乐器主人才能删除保养记录')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除这条保养记录吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await maintenanceApi.remove(id)
    ElMessage.success('已删除')
    loadMaintenances()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e?.response?.data?.error || '删除失败')
    }
  }
}

const submitBorrow = async () => {
  if (!userStore.isLoggedIn) {
    showBorrow.value = false
    requireLogin()
    return
  }
  if (!borrowForm.dates) {
    ElMessage.warning('请选择借用日期')
    return
  }
  submitting.value = true
  try {
    const result = await borrowApi.create({
      instrumentId: instrument.value.id,
      borrowerId: userStore.userId,
      ownerId: instrument.value.ownerId,
      startDate: borrowForm.dates[0].toISOString().split('T')[0],
      endDate: borrowForm.dates[1].toISOString().split('T')[0],
      purpose: borrowForm.purpose,
      depositPaid: instrument.value.deposit,
      feeTotal: estimatedFee.value
    })
    ElMessage.success('借用申请已发送，请等待主人确认！')
    showBorrow.value = false
    router.push('/messages')
  } catch (e) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const submitInvite = async () => {
  if (!userStore.isLoggedIn) {
    showInvite.value = false
    requireLogin()
    return
  }
  if (!inviteForm.instrument || !inviteForm.meetTime || !inviteForm.location) {
    ElMessage.warning('请填写完整的邀约信息')
    return
  }
  submitting.value = true
  try {
    await invitationApi.create({
      inviterId: userStore.userId,
      inviteeId: instrument.value.ownerId,
      instrument: inviteForm.instrument,
      piece: inviteForm.piece,
      skillLevelMatch: `${userStore.currentUser.skillLevel}-${instrument.value.owner?.skillLevel}`,
      meetTime: new Date(inviteForm.meetTime).toLocaleString('zh-CN', { hour12: false }),
      location: inviteForm.location,
      latitude: instrument.value.latitude,
      longitude: instrument.value.longitude,
      message: inviteForm.message
    })
    ElMessage.success('邀约已发送，期待好消息！')
    showInvite.value = false
    router.push('/messages')
  } catch (e) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.breadcrumb {
  margin: 20px 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.image-section {
  padding: 24px;
}

.main-image {
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 4/3;
  object-fit: cover;
  margin-bottom: 16px;
}

.image-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.inst-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.info-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

.info-meta > span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.highlight {
  color: var(--success-color) !important;
  font-weight: 600;
}

.price-block {
  padding: 20px;
  background: linear-gradient(135deg, #f0f4ff, #faf5ff);
  border-radius: 12px;
  margin-bottom: 20px;
}

.daily-fee {
  margin-bottom: 10px;
}

.currency {
  font-size: 20px;
  color: var(--primary-color);
  vertical-align: top;
}

.num {
  font-size: 40px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.unit {
  font-size: 14px;
  color: var(--text-secondary);
}

.fee-info {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: var(--text-secondary);
}

.fee-info b {
  color: var(--text-primary);
}

.action-row {
  display: flex;
  gap: 12px;
}

.action-row .el-button {
  flex: 1;
}

.desc-card h3,
.owner-card h3,
.section-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  margin-bottom: 14px;
}

.desc-card h4 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.desc-card p {
  line-height: 1.8;
  color: var(--text-primary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.tag-time {
  background: #ecfeff;
  color: #0e7490;
}

.owner-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.owner-info {
  display: flex;
  gap: 14px;
  flex: 1;
}

.owner-detail {
  flex: 1;
}

.owner-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.owner-level {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #f59e0b;
}

.owner-bio {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.section-card {
  padding: 24px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: var(--bg-light);
  border-radius: 10px;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.reviewer {
  font-weight: 500;
}

.review-text {
  line-height: 1.6;
  margin-bottom: 6px;
}

.review-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.text-danger {
  color: var(--danger-color);
  font-weight: 600;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.section-header-row h3 {
  margin-bottom: 0;
}

.empty-maintain {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.maintain-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.maintain-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: var(--bg-light);
  border-radius: 10px;
}

.maintain-left {
  flex-shrink: 0;
}

.maintain-type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-change-string {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge-tuning {
  background: #fef3c7;
  color: #b45309;
}

.badge-repair {
  background: #fee2e2;
  color: #dc2626;
}

.badge-clean {
  background: #d1fae5;
  color: #059669;
}

.badge-accessory {
  background: #ede9fe;
  color: #7c3aed;
}

.maintain-right {
  flex: 1;
  min-width: 0;
}

.maintain-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.maintain-date {
  font-weight: 600;
  font-size: 14px;
}

.maintain-cost {
  font-size: 13px;
  color: var(--danger-color);
  font-weight: 500;
}

.maintain-desc {
  line-height: 1.6;
  font-size: 13px;
  color: var(--text-secondary);
}

.maintain-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 10px 14px;
  background: #eff6ff;
  border-radius: 8px;
  font-size: 13px;
  color: #1d4ed8;
}

.mt-20 {
  margin-top: 20px;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
