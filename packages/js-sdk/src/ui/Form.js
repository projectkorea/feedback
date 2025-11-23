export class Form {
  constructor(onSubmit) {
    this.onSubmit = onSubmit;
    this.form = null;
  }

  render() {
    this.form = document.createElement('form');
    this.form.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    this.form.innerHTML = `
      <h2 style="margin: 0 0 8px 0; font-size: 24px; color: #111;">피드백 보내기</h2>
      <p style="margin: 0; color: #666; font-size: 14px;">의견을 들려주세요. 소중한 피드백 감사합니다!</p>

      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">
          카테고리
        </label>
        <select
          name="category"
          required
          style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-family: inherit;
            font-size: 14px;
            cursor: pointer;
          "
        >
          <option value="bug">🐛 버그 신고</option>
          <option value="feature">✨ 기능 요청</option>
          <option value="improvement">🚀 개선 제안</option>
        </select>
      </div>

      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">
          평점 (선택)
        </label>
        <div style="display: flex; gap: 8px;">
          ${[1, 2, 3, 4, 5].map(n => `
            <button type="button" class="rating-btn" data-rating="${n}" style="
              width: 48px;
              height: 48px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              background: white;
              cursor: pointer;
              font-size: 24px;
              transition: all 0.2s;
            ">${'⭐'.repeat(n)}</button>
          `).join('')}
        </div>
      </div>

      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">
          메시지 *
        </label>
        <textarea
          name="message"
          required
          rows="4"
          placeholder="여기에 의견을 작성해주세요..."
          style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
          "
        ></textarea>
      </div>

      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">
          이메일 (선택)
        </label>
        <input
          type="email"
          name="userEmail"
          placeholder="your@email.com"
          style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-family: inherit;
            font-size: 14px;
          "
        />
      </div>

      <button
        type="submit"
        style="
          padding: 12px 24px;
          background: #4F46E5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        "
      >
        전송하기
      </button>
    `;

    let selectedRating = null;

    this.form.querySelectorAll('.rating-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.form.querySelectorAll('.rating-btn').forEach(b => {
          b.style.borderColor = '#e5e7eb';
          b.style.background = 'white';
        });
        btn.style.borderColor = '#4F46E5';
        btn.style.background = '#EEF2FF';
        selectedRating = parseInt(btn.dataset.rating);
      });
    });

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
      const data = {
        category: formData.get('category'),
        message: formData.get('message'),
        userEmail: formData.get('userEmail') || undefined,
        rating: selectedRating || undefined
      };
      await this.onSubmit(data);
    });

    return this.form;
  }

  reset() {
    this.form?.reset();
    this.form?.querySelectorAll('.rating-btn').forEach(btn => {
      btn.style.borderColor = '#e5e7eb';
      btn.style.background = 'white';
    });
  }
}
