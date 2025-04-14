import { postMessageToPlugin } from '../../utils/messaging';

export class Header {
  private container: HTMLElement;

  constructor(title: string = 'DocFlow') {
    this.container = document.createElement('div');
    this.container.className = 'plugin-header';
    this.render(title);
    this.attachEventListeners();
  }

  private render(title: string): void {
    this.container.innerHTML = `
      <div class="header-content">
        <div class="header-left">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.0625 1.75V3.9375H12.25" stroke="currentColor" stroke-linejoin="round"/>
            <path d="M1.8125 1.75C1.8125 1.47386 1.58864 1.25 1.3125 1.25C1.03636 1.25 0.8125 1.47386 0.8125 1.75H1.8125ZM1.3125 10.5H0.8125C0.8125 10.7761 1.03636 11 1.3125 11V10.5ZM0.8125 1.75V10.5H1.8125V1.75H0.8125ZM1.3125 11H7.875V10H1.3125V11Z" fill="currentColor"/>
            <path d="M5.6875 8.3125L7.875 10.5L5.6875 12.6875" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.5 12.5H12.5V3.5L10.5 1.5H5.5V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h1 class="header-title">${title}</h1>
        </div>
        <button class="header-close" aria-label="Close plugin">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;
  }

  private attachEventListeners(): void {
    const closeButton = this.container.querySelector('.header-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        postMessageToPlugin({ type: 'close' });
      });
    }
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}