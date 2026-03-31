(function() {
  'use strict';
  
  var ImageViewer = {
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    
    init: function() {
      this.createStyles();
      this.createModal();
      this.bindEvents();
    },
    
    createStyles: function() {
      var style = document.createElement('style');
      style.textContent = `
        .image-viewer-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.92);
          z-index: 99999;
          justify-content: center;
          align-items: center;
          cursor: zoom-out;
        }
        .image-viewer-modal.active {
          display: flex;
        }
        .image-viewer-modal img {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
          transition: transform 0.15s ease;
          cursor: grab;
          user-select: none;
        }
        .image-viewer-modal img:active {
          cursor: grabbing;
        }
        .image-viewer-close {
          position: absolute;
          top: 20px;
          right: 20px;
          color: white;
          font-size: 28px;
          cursor: pointer;
          z-index: 100000;
          width: 44px;
          height: 44px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          transition: background 0.3s;
        }
        .image-viewer-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .image-viewer-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          font-size: 32px;
          cursor: pointer;
          z-index: 100000;
          width: 50px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          transition: background 0.3s;
        }
        .image-viewer-nav:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .image-viewer-prev {
          left: 20px;
        }
        .image-viewer-next {
          right: 20px;
        }
        .image-viewer-counter {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 15px;
          background: rgba(0, 0, 0, 0.6);
          padding: 8px 18px;
          border-radius: 20px;
        }
        .image-viewer-toolbar {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          background: rgba(0, 0, 0, 0.6);
          padding: 12px 20px;
          border-radius: 30px;
        }
        .image-viewer-toolbar button {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          padding: 10px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 15px;
          transition: background 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .image-viewer-toolbar button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `;
      document.head.appendChild(style);
    },
    
    createModal: function() {
      var modal = document.createElement('div');
      modal.className = 'image-viewer-modal';
      modal.id = 'image-viewer-modal';
      modal.innerHTML = `
        <span class="image-viewer-close">&times;</span>
        <span class="image-viewer-nav image-viewer-prev">&#10094;</span>
        <span class="image-viewer-nav image-viewer-next">&#10095;</span>
        <img src="" alt="preview" draggable="false">
        <div class="image-viewer-counter"></div>
        <div class="image-viewer-toolbar">
          <button onclick="ImageViewer.zoomIn()">🔍+ 放大</button>
          <button onclick="ImageViewer.zoomOut()">🔍- 缩小</button>
          <button onclick="ImageViewer.rotateLeft()">↺ 左转</button>
          <button onclick="ImageViewer.rotateRight()">↻ 右转</button>
          <button onclick="ImageViewer.download()">⬇ 下载</button>
          <button onclick="ImageViewer.resetZoom()">↺ 重置</button>
        </div>
      `;
      document.body.appendChild(modal);
      this.modal = modal;
      this.img = modal.querySelector('img');
      this.counter = modal.querySelector('.image-viewer-counter');
      this.currentImages = [];
      this.currentIndex = 0;
    },
    
    bindEvents: function() {
      var self = this;
      
      document.addEventListener('click', function(e) {
        var target = e.target;
        if (target.tagName === 'IMG' && self.isContentImage(target)) {
          e.preventDefault();
          e.stopPropagation();
          self.open(target);
        }
      });
      
      this.modal.addEventListener('click', function(e) {
        if (e.target === self.modal || e.target.classList.contains('image-viewer-close')) {
          self.close();
        }
      });
      
      this.modal.querySelector('.image-viewer-prev').addEventListener('click', function(e) {
        e.stopPropagation();
        self.prev();
      });
      
      this.modal.querySelector('.image-viewer-next').addEventListener('click', function(e) {
        e.stopPropagation();
        self.next();
      });
      
      document.addEventListener('keydown', function(e) {
        if (!self.modal.classList.contains('active')) return;
        if (e.key === 'Escape') self.close();
        if (e.key === 'ArrowLeft') self.prev();
        if (e.key === 'ArrowRight') self.next();
      });
      
      this.img.addEventListener('mousedown', function(e) {
        e.preventDefault();
        self.isDragging = true;
        self.startX = e.clientX - self.translateX;
        self.startY = e.clientY - self.translateY;
        self.img.style.cursor = 'grabbing';
      });
      
      document.addEventListener('mousemove', function(e) {
        if (!self.isDragging) return;
        self.translateX = e.clientX - self.startX;
        self.translateY = e.clientY - self.startY;
        self.updateTransform();
      });
      
      document.addEventListener('mouseup', function() {
        self.isDragging = false;
        self.img.style.cursor = 'grab';
      });
      
      this.modal.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
          self.zoomIn();
        } else {
          self.zoomOut();
        }
      });
    },
    
    isContentImage: function(img) {
      var parent = img.closest('.md-text, .article-content, .post-body, .post-content');
      if (!parent) return false;
      if (img.closest('a') && img.closest('a').href !== img.src) return false;
      return true;
    },
    
    open: function(img) {
      this.currentImages = this.getContentImages();
      this.currentIndex = this.currentImages.indexOf(img.src);
      if (this.currentIndex === -1) this.currentIndex = 0;
      
      this.resetState();
      this.img.src = img.src;
      this.updateCounter();
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    },
    
    close: function() {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    },
    
    prev: function() {
      if (this.currentImages.length <= 1) return;
      this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
      this.img.src = this.currentImages[this.currentIndex];
      this.resetState();
      this.updateCounter();
    },
    
    next: function() {
      if (this.currentImages.length <= 1) return;
      this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
      this.img.src = this.currentImages[this.currentIndex];
      this.resetState();
      this.updateCounter();
    },
    
    getContentImages: function() {
      var images = [];
      var content = document.querySelector('.md-text, .article-content, .post-body, .post-content');
      if (content) {
        var imgs = content.querySelectorAll('img');
        imgs.forEach(function(img) {
          images.push(img.src);
        });
      }
      return images;
    },
    
    updateCounter: function() {
      if (this.currentImages.length > 1) {
        this.counter.textContent = (this.currentIndex + 1) + ' / ' + this.currentImages.length;
      } else {
        this.counter.textContent = '';
      }
    },
    
    resetState: function() {
      this.scale = 1;
      this.rotation = 0;
      this.translateX = 0;
      this.translateY = 0;
      this.updateTransform();
    },
    
    updateTransform: function() {
      this.img.style.transform = 'scale(' + this.scale + ') rotate(' + this.rotation + 'deg) translate(' + (this.translateX / this.scale) + 'px, ' + (this.translateY / this.scale) + 'px)';
    },
    
    zoomIn: function() {
      this.scale = Math.min(this.scale + 0.25, 5);
      this.updateTransform();
    },
    
    zoomOut: function() {
      this.scale = Math.max(this.scale - 0.25, 0.25);
      this.updateTransform();
    },
    
    rotateLeft: function() {
      this.rotation -= 90;
      this.updateTransform();
    },
    
    rotateRight: function() {
      this.rotation += 90;
      this.updateTransform();
    },
    
    resetZoom: function() {
      this.resetState();
    },
    
    download: function() {
      var link = document.createElement('a');
      link.href = this.img.src;
      link.download = this.img.src.split('/').pop() || 'image.jpg';
      link.click();
    }
  };
  
  window.ImageViewer = ImageViewer;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ImageViewer.init();
    });
  } else {
    ImageViewer.init();
  }
})();
