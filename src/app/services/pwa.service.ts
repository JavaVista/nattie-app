import { inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Platform } from '@ionic/angular/standalone';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private platform = inject(Platform);
  private updateCheckInterval?: number;

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.setupUpdateListener();
    }
  }

  public initPwaPrompt() {
    if (this.platform.is('hybrid')) {
      // Native Android app
      this.platform.ready().then(() => {
        console.log('🤖 Android app ready - checking for updates...');
        this.checkForUpdate();
        this.setupPeriodicUpdates();
      });
    } else {
      // Web PWA
      console.log('🌐 Web PWA ready - setting up update monitoring...');
      this.setupPeriodicUpdates();
    }
  }

  private setupUpdateListener() {
    // Listen for new versions
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map((evt) => ({
          type: 'UPDATE_AVAILABLE',
          current: evt.currentVersion,
          available: evt.latestVersion,
        }))
      )
      .subscribe((evt) => {
        console.log('🆕 New version available!', evt);
        this.promptUpdate();
      });
  }

  private setupPeriodicUpdates() {
    // Different strategies for hybrid vs web
    const checkInterval = this.platform.is('hybrid')
      ? 10 * 60 * 1000 // 10 minutes for mobile apps
      : 30 * 60 * 1000; // 30 minutes for web

    this.updateCheckInterval = window.setInterval(() => {
      this.checkForUpdate();
    }, checkInterval);
  }

  private async promptUpdate() {
    if (this.platform.is('hybrid')) {
      // 🤖 Android: More aggressive update strategy
      console.log('📱 Mobile app - auto-updating...');

      // Optional: Show a brief toast before updating
      setTimeout(() => {
        this.activateUpdate();
      }, 2000);
    } else {
      // 🌐 Web: User-friendly prompt
      const updateConfirmed = confirm(
        'A new version of Nattie is available. Update now for the latest features?'
      );

      if (updateConfirmed) {
        this.activateUpdate();
      }
    }
  }

  private activateUpdate() {
    this.swUpdate
      .activateUpdate()
      .then(() => {
        console.log('✅ App updated successfully!');

        if (this.platform.is('hybrid')) {
          // Mobile: Reload the webview
          window.location.reload();
        } else {
          // Web: Smooth reload
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error('❌ Update failed:', err);
      });
  }

  public async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      console.log('⚠️ Service Worker not enabled');
      return false;
    }

    try {
      const updateAvailable = await this.swUpdate.checkForUpdate();
      console.log(
        updateAvailable ? '🆕 Update available!' : '✅ App is up to date'
      );
      return updateAvailable;
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      return false;
    }
  }

  public destroy() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
  }

  // For debugging
  public async getCacheStatus() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('📦 Available caches:', cacheNames);
      return cacheNames;
    }
    return [];
  }

  public async forceRefresh() {
    await this.clearCache();
    window.location.reload();
  }

  private async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log('🗑️ All caches cleared');
    }
  }
}
