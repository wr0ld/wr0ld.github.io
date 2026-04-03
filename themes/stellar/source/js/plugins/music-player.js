(function() {
  'use strict';
  
  var MusicPlayer = {
    enabled: false,
    container: null,
    player: null,
    playlist: [],
    isPlaying: false,
    
    init: function() {
      this.enabled = localStorage.getItem('musicPlayerEnabled') === 'true';
      this.playlist = JSON.parse(localStorage.getItem('musicPlaylist') || '[]');
      
      if (this.enabled) {
        this.loadAPlayer();
      }
      
      this.bindStorageEvent();
    },
    
    loadAPlayer: function() {
      var self = this;
      
      if (window.APlayer) {
        self.createPlayer();
        return;
      }
      
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css';
      document.head.appendChild(css);
      
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js';
      script.onload = function() {
        self.createPlayer();
      };
      document.head.appendChild(script);
    },
    
    createPlayer: function() {
      if (this.container) {
        return;
      }
      
      var self = this;
      var savedVolume = parseInt(localStorage.getItem('musicVolume') || '50') / 100;
      
      this.container = document.createElement('div');
      this.container.id = 'music-player-container';
      this.container.innerHTML = '<div id="aplayer"></div>';
      document.body.appendChild(this.container);
      
      this.addStyles();
      
      this.player = new APlayer({
        container: document.getElementById('aplayer'),
        fixed: true,
        autoplay: false,
        theme: '#3498db',
        loop: 'all',
        order: 'list',
        preload: 'auto',
        volume: savedVolume,
        mutex: true,
        listFolded: true,
        listMaxHeight: 200,
        lrcType: 0,
        audio: this.playlist.length > 0 ? this.playlist : []
      });
      
      this.player.on('play', function() {
        self.isPlaying = true;
      });
      
      this.player.on('pause', function() {
        self.isPlaying = false;
      });
    },
    
    addStyles: function() {
      var style = document.createElement('style');
      style.textContent = [
        '#music-player-container {',
        '  position: fixed;',
        '  bottom: 20px;',
        '  left: 20px;',
        '  z-index: 999;',
        '  max-width: 380px;',
        '}',
        '#music-player-container .aplayer {',
        '  margin: 0;',
        '  box-shadow: 0 4px 20px rgba(0,0,0,0.15);',
        '  border-radius: 12px;',
        '  overflow: hidden;',
        '}',
        '@media (max-width: 768px) {',
        '  #music-player-container {',
        '    left: 10px;',
        '    right: 10px;',
        '    max-width: none;',
        '    bottom: 80px;',
        '  }',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    },
    
    addSong: function(song) {
      var audio = {
        name: song.name,
        artist: song.artist || '未知歌手',
        url: song.url,
        cover: song.cover || ''
      };
      
      this.playlist.push(audio);
      localStorage.setItem('musicPlaylist', JSON.stringify(this.playlist));
      
      if (this.player) {
        this.player.list.add(audio);
      }
    },
    
    clearPlaylist: function() {
      this.playlist = [];
      localStorage.setItem('musicPlaylist', JSON.stringify(this.playlist));
      
      if (this.player) {
        this.player.list.clear();
      }
    },
    
    setVolume: function(volume) {
      if (this.player) {
        this.player.volume(volume);
      }
    },
    
    removeSong: function(index) {
      if (index >= 0 && index < this.playlist.length) {
        this.playlist.splice(index, 1);
        localStorage.setItem('musicPlaylist', JSON.stringify(this.playlist));
        
        if (this.player) {
          this.player.list.remove(index);
        }
      }
    },
    
    destroyPlayer: function() {
      if (this.player) {
        this.player.destroy();
        this.player = null;
      }
      if (this.container) {
        this.container.remove();
        this.container = null;
      }
    },
    
    enable: function() {
      this.enabled = true;
      localStorage.setItem('musicPlayerEnabled', 'true');
      this.loadAPlayer();
    },
    
    disable: function() {
      this.enabled = false;
      localStorage.setItem('musicPlayerEnabled', 'false');
      this.destroyPlayer();
    },
    
    toggle: function() {
      if (this.enabled) {
        this.disable();
      } else {
        this.enable();
      }
    },
    
    bindStorageEvent: function() {
      var self = this;
      window.addEventListener('storage', function(e) {
        if (e.key === 'musicPlayerEnabled') {
          var newValue = e.newValue === 'true';
          if (newValue !== self.enabled) {
            self.enabled = newValue;
            if (newValue) {
              self.loadAPlayer();
            } else {
              self.destroyPlayer();
            }
          }
        }
      });
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      MusicPlayer.init();
    });
  } else {
    MusicPlayer.init();
  }
  
  window.MusicPlayer = MusicPlayer;
})();
