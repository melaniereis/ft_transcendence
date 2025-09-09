import { AVAILABLE_AVATARS } from './types.js';
import { GRID_COLORS, svgChartIcon } from './constants.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
    ? localStorage.getItem('preferredLanguage')
    : 'en') as keyof typeof translations;
const t = translations[lang];

export function modals(): string {
    return `
    <div id="notification" style="display:none;position:fixed;top:20px;right:20px;background:${GRID_COLORS.success};color:#fff;padding:15px 20px;border-radius:5px;z-index:1000;max-width:300px"></div>
    <div id="avatar-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);justify-content:center;align-items:center;z-index:2000">
      <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:30px;border-radius:15px;width:600px;max-width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 30px rgba(0,174,239,0.2);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="margin:0;color:${GRID_COLORS.primary};font-size:20px">🖼️ ${t.chooseAvatar}</h3>
          <button id="avatar-modal-close" style="background:none;border:none;font-size:24px;cursor:pointer;color:${GRID_COLORS.muted};width:30px;height:30px;display:flex;align-items:center;justify-content:center">×</button>
        </div>
        <p style="color:${GRID_COLORS.muted};margin-bottom:20px;font-size:14px">${t.selectAvatar}</p>
        <div id="avatar-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:12px">
${AVAILABLE_AVATARS.map((a, i) => `
            <div class="avatar-option" data-avatar="${a}" style="cursor:pointer;border:3px solid transparent;border-radius:12px;padding:8px;transition:all 0.3s;background:linear-gradient(135deg, ${GRID_COLORS.bg} 0%, white 100%);">
              <img src="${a}" width="64" height="64" style="border-radius:50%;object-fit:cover;display:block;width:100%" alt="${t.avatarAlt} ${i + 1}"/>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:20px;text-align:center">
          <button id="avatar-confirm" disabled style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:14px;opacity:0.5">${t.selectAvatarBtn}</button>
        </div>
      </div>
    </div>
    <div id="pass-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:2000">
      <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:30px;border-radius:10px;width:400px;max-width:90%;box-shadow:0 10px 30px rgba(0,174,239,0.2);">
        <h3 style="margin:0 0 20px 0;color:${GRID_COLORS.primary}">🔒 ${t.changePassword}</h3>
        <form id="pass-form">
          <div style="margin-bottom:15px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">${t.currentPassword}:
              <input id="pass-cur" type="password" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
            </label>
          </div>
          <div style="margin-bottom:15px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">${t.newPassword}:
              <input id="pass-new" type="password" minlength="6" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
            </label>
            <small style="color:${GRID_COLORS.muted}">${t.minCharNote}</small>
          </div>
          <div style="margin-bottom:20px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">${t.confirmPassword}:
              <input id="pass-conf" type="password" minlength="6" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
            </label>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button type="button" id="pass-cancel" style="background:${GRID_COLORS.muted};color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">${t.cancel}</button>
            <button type="submit" style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">${t.updatePassword}</button>
          </div>
          <div id="pass-error" style="color:${GRID_COLORS.accent};margin-top:10px;font-size:14px"></div>
        </form>
      </div>
    </div>
  `;
}
