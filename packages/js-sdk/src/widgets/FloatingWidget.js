import { FEEDBACK_TYPES } from '@feedback-sdk/core';
import { Modal } from '../ui/Modal.js';

export class FloatingWidget {
  constructor(client, config, container) {
    this.client = client;
    this.config = config;
    this.container = container;
    this.button = null;
    this.modal = null;
  }

  render() {
    this.button = this.createButton();
    this.container.appendChild(this.button);

    this.modal = new Modal(this.client, this.config, this.container);
    this.modal.render();

    this.button.addEventListener('click', () => this.modal.open());
  }

  createButton() {
    const button = document.createElement('button');
    button.id = 'feedback-floating-button';
    button.textContent = '💬';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #4F46E5;
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      transition: transform 0.2s;
    `;
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
    return button;
  }

  show() {
    if (this.button) this.button.style.display = 'block';
  }

  hide() {
    if (this.button) this.button.style.display = 'none';
  }

  destroy() {
    this.button?.remove();
    this.modal?.destroy();
  }
}
