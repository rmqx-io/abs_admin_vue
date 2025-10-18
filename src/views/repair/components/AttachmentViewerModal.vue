<template>
  <a-modal
    :visible="visible"
    :title="`附件查看 (${currentIndex + 1}/${attachments.length})`"
    width="90%"
    :footer="null"
    @cancel="handleCancel"
    :destroyOnClose="true"
    :bodyStyle="{ padding: '12px' }"
    wrapClassName="attachment-viewer-modal"
  >
    <div v-if="attachments.length > 0" class="attachment-viewer">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <a-button-group>
            <a-button
              :disabled="currentIndex === 0"
              @click="prevAttachment"
              icon="left"
            >
              上一个
            </a-button>
            <a-button
              :disabled="currentIndex === attachments.length - 1"
              @click="nextAttachment"
              icon="right"
            >
              下一个
            </a-button>
          </a-button-group>
          
          <a-button
            @click="downloadAttachment"
            icon="download"
            type="primary"
            style="margin-left: 12px"
          >
            下载
          </a-button>
        </div>

        <div class="toolbar-right">
          <div class="attachment-info">
            <span class="file-name">{{ currentAttachment.name }}</span>
            <span class="file-size">{{ formatFileSize(currentAttachment.size) }}</span>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 图片预览 -->
        <div v-if="isImage(currentAttachment)" class="image-preview">
          <img
            :src="currentAttachment.url"
            :alt="currentAttachment.name"
            @load="handleImageLoad"
            @error="handleImageError"
          />
        </div>

        <!-- PDF预览 -->
        <div v-else-if="isPdf(currentAttachment)" class="pdf-preview">
          <iframe
            :src="currentAttachment.url"
            frameborder="0"
            width="100%"
            height="100%"
          ></iframe>
        </div>

        <!-- 视频预览 -->
        <div v-else-if="isVideo(currentAttachment)" class="video-preview">
          <video
            :src="currentAttachment.url"
            controls
            width="100%"
            height="auto"
            @loadstart="handleVideoLoad"
            @error="handleVideoError"
          >
            您的浏览器不支持视频播放
          </video>
        </div>

        <!-- 音频预览 -->
        <div v-else-if="isAudio(currentAttachment)" class="audio-preview">
          <div class="audio-container">
            <a-icon type="sound" class="audio-icon" />
            <div class="audio-info">
              <div class="audio-name">{{ currentAttachment.name }}</div>
              <audio
                :src="currentAttachment.url"
                controls
                width="100%"
                @loadstart="handleAudioLoad"
                @error="handleAudioError"
              >
                您的浏览器不支持音频播放
              </audio>
            </div>
          </div>
        </div>

        <!-- 文本文件预览 -->
        <div v-else-if="isText(currentAttachment)" class="text-preview">
          <div class="text-container">
            <a-spin :spinning="textLoading">
              <pre v-if="textContent" class="text-content">{{ textContent }}</pre>
              <div v-else class="text-placeholder">
                <a-icon type="file-text" />
                <div>正在加载文本内容...</div>
              </div>
            </a-spin>
          </div>
        </div>

        <!-- 其他文件类型 -->
        <div v-else class="file-preview">
          <div class="file-container">
            <div class="file-icon">
              <a-icon :type="getFileIcon(currentAttachment)" />
            </div>
            <div class="file-info">
              <div class="file-name">{{ currentAttachment.name }}</div>
              <div class="file-type">{{ getFileType(currentAttachment.name) }}</div>
              <div class="file-size">{{ formatFileSize(currentAttachment.size) }}</div>
              <a-button
                type="primary"
                @click="downloadAttachment"
                style="margin-top: 12px"
              >
                <a-icon type="download" />
                下载文件
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 缩略图导航 -->
      <div v-if="attachments.length > 1" class="thumbnail-nav">
        <div class="thumbnail-list">
          <div
            v-for="(attachment, index) in attachments"
            :key="index"
            :class="['thumbnail-item', { active: index === currentIndex }]"
            @click="currentIndex = index"
          >
            <div class="thumbnail">
              <img
                v-if="isImage(attachment)"
                :src="getThumbnailUrl(attachment)"
                :alt="attachment.name"
              />
              <a-icon
                v-else
                :type="getFileIcon(attachment)"
                class="file-icon"
              />
            </div>
            <div class="thumbnail-name">{{ attachment.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <a-empty description="没有附件" />
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'AttachmentViewerModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    attachments: {
      type: Array,
      default: () => []
    },
    initialIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentIndex: 0,
      textContent: '',
      textLoading: false
    }
  },
  computed: {
    currentAttachment() {
      return this.attachments[this.currentIndex] || {}
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.currentIndex = this.initialIndex
        this.loadTextContent()
      }
    },
    currentIndex() {
      this.loadTextContent()
    }
  },
  methods: {
    handleCancel() {
      this.$emit('close')
    },

    prevAttachment() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },

    nextAttachment() {
      if (this.currentIndex < this.attachments.length - 1) {
        this.currentIndex++
      }
    },

    downloadAttachment() {
      const attachment = this.currentAttachment
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      this.$message.success('开始下载')
    },

    isImage(attachment) {
      const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
      const extension = this.getFileExtension(attachment.name)
      return imageTypes.includes(extension)
    },

    isPdf(attachment) {
      return this.getFileExtension(attachment.name) === '.pdf'
    },

    isVideo(attachment) {
      const videoTypes = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
      const extension = this.getFileExtension(attachment.name)
      return videoTypes.includes(extension)
    },

    isAudio(attachment) {
      const audioTypes = ['.mp3', '.wav', '.ogg', '.aac', '.flac']
      const extension = this.getFileExtension(attachment.name)
      return audioTypes.includes(extension)
    },

    isText(attachment) {
      const textTypes = ['.txt', '.log', '.json', '.xml', '.csv']
      const extension = this.getFileExtension(attachment.name)
      return textTypes.includes(extension)
    },

    getFileExtension(fileName) {
      return fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    },

    getFileType(fileName) {
      const extension = this.getFileExtension(fileName)
      const typeMap = {
        '.jpg': 'JPEG图片',
        '.jpeg': 'JPEG图片',
        '.png': 'PNG图片',
        '.gif': 'GIF图片',
        '.pdf': 'PDF文档',
        '.doc': 'Word文档',
        '.docx': 'Word文档',
        '.xls': 'Excel表格',
        '.xlsx': 'Excel表格',
        '.ppt': 'PowerPoint演示',
        '.pptx': 'PowerPoint演示',
        '.txt': '文本文件',
        '.mp4': 'MP4视频',
        '.avi': 'AVI视频',
        '.mp3': 'MP3音频',
        '.wav': 'WAV音频',
        '.zip': 'ZIP压缩包',
        '.rar': 'RAR压缩包'
      }
      return typeMap[extension] || '未知类型'
    },

    getFileIcon(attachment) {
      const extension = this.getFileExtension(attachment.name)
      const iconMap = {
        '.jpg': 'file-image',
        '.jpeg': 'file-image',
        '.png': 'file-image',
        '.gif': 'file-image',
        '.pdf': 'file-pdf',
        '.doc': 'file-word',
        '.docx': 'file-word',
        '.xls': 'file-excel',
        '.xlsx': 'file-excel',
        '.ppt': 'file-ppt',
        '.pptx': 'file-ppt',
        '.txt': 'file-text',
        '.mp4': 'play-circle',
        '.avi': 'play-circle',
        '.mp3': 'sound',
        '.wav': 'sound',
        '.zip': 'file-zip',
        '.rar': 'file-zip'
      }
      return iconMap[extension] || 'file'
    },

    getThumbnailUrl(attachment) {
      if (this.isImage(attachment)) {
        return attachment.url
      }
      return null
    },

    formatFileSize(bytes) {
      if (!bytes) return '未知大小'
      
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    },

    async loadTextContent() {
      if (this.isText(this.currentAttachment)) {
        this.textLoading = true
        try {
          const response = await fetch(this.currentAttachment.url)
          this.textContent = await response.text()
        } catch (error) {
          console.error('加载文本失败:', error)
          this.textContent = '加载文本内容失败'
        } finally {
          this.textLoading = false
        }
      } else {
        this.textContent = ''
      }
    },

    handleImageLoad() {
      // 图片加载成功
    },

    handleImageError() {
      this.$message.error('图片加载失败')
    },

    handleVideoLoad() {
      // 视频开始加载
    },

    handleVideoError() {
      this.$message.error('视频加载失败')
    },

    handleAudioLoad() {
      // 音频开始加载
    },

    handleAudioError() {
      this.$message.error('音频加载失败')
    }
  }
}
</script>

<style scoped>
.attachment-viewer {
  height: 80vh;
  display: flex;
  flex-direction: column;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 12px;

    .toolbar-right {
      .attachment-info {
        text-align: right;

        .file-name {
          display: block;
          font-weight: 500;
          color: #262626;
          margin-bottom: 4px;
        }

        .file-size {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
  }

  .content-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    border-radius: 6px;
    overflow: hidden;

    .image-preview {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .pdf-preview,
    .video-preview {
      width: 100%;
      height: 100%;
    }

    .audio-preview {
      .audio-container {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 32px;

        .audio-icon {
          font-size: 48px;
          color: #1890ff;
        }

        .audio-info {
          .audio-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 12px;
            color: #262626;
          }
        }
      }
    }

    .text-preview {
      width: 100%;
      height: 100%;
      padding: 16px;

      .text-container {
        width: 100%;
        height: 100%;
        background: white;
        border-radius: 4px;

        .text-content {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 16px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          overflow: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .text-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #8c8c8c;

          .anticon {
            font-size: 48px;
            margin-bottom: 12px;
          }
        }
      }
    }

    .file-preview {
      .file-container {
        text-align: center;
        padding: 32px;

        .file-icon {
          font-size: 64px;
          color: #1890ff;
          margin-bottom: 16px;
        }

        .file-info {
          .file-name {
            font-size: 16px;
            font-weight: 500;
            color: #262626;
            margin-bottom: 8px;
          }

          .file-type {
            font-size: 14px;
            color: #595959;
            margin-bottom: 4px;
          }

          .file-size {
            font-size: 12px;
            color: #8c8c8c;
            margin-bottom: 16px;
          }
        }
      }
    }
  }

  .thumbnail-nav {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .thumbnail-list {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 8px 0;

      .thumbnail-item {
        flex-shrink: 0;
        width: 80px;
        text-align: center;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background: #f5f5f5;
        }

        &.active {
          background: #e6f7ff;
          border: 1px solid #1890ff;
        }

        .thumbnail {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          border-radius: 4px;
          margin-bottom: 4px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .file-icon {
            font-size: 24px;
            color: #1890ff;
          }
        }

        .thumbnail-name {
          font-size: 11px;
          color: #8c8c8c;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.empty-state {
  padding: 40px;
  text-align: center;
}

:global(.attachment-viewer-modal .ant-modal-body) {
  height: 80vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  .attachment-viewer {
    height: 70vh;

    .toolbar {
      flex-direction: column;
      gap: 12px;

      .toolbar-left,
      .toolbar-right {
        width: 100%;
      }

      .toolbar-right {
        .attachment-info {
          text-align: center;
        }
      }
    }

    .thumbnail-nav {
      .thumbnail-list {
        justify-content: center;
      }
    }
  }
}
</style>
