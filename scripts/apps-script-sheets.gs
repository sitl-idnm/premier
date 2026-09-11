// ─────────────────────────────────────────────────────────────────────────
// Google Apps Script для приёма заявок из VK в Google-таблицу.
// Как использовать:
//   1. Откройте свою таблицу на sheets.google.com
//   2. Меню: Расширения → Apps Script
//   3. Удалите весь код в редакторе и вставьте ВЕСЬ этот файл
//   4. Развернуть → Новое развёртывание → тип «Веб-приложение»
//        • Выполнять от имени: Я
//        • У кого есть доступ: Все
//      → Развернуть → авторизовать доступ
//   5. Скопируйте выданный URL (оканчивается на /exec) — это SHEETS_WEBAPP_URL
// ─────────────────────────────────────────────────────────────────────────

const SECRET = 'PASTE_YOUR_SHEETS_WEBAPP_SECRET_HERE'; // must equal SHEETS_WEBAPP_SECRET in env
const SHEET_NAME = 'Лист1'; // имя листа с заявками (поменяйте, если другое)

// Названия столбцов (создаются автоматически, если лист пустой).
// Колонки «Качество/Комментарий/Результат» заполняются менеджером вручную —
// при вставке заявки они всегда пустые и больше не перезаписываются (дедуп по id).
// «id» — служебный столбец для дедупа, стоит последним (его можно скрыть).
const HEADERS = [
  'Дата',
  'Время',
  'Телефон',
  'Имя',
  'Источник',
  'Качество',
  'Комментарий',
  'Результат',
  'E-mail',
  'Тип мероприятия',
  'Тариф',
  'Детей',
  'Время начала',
  'Желаемая дата',
  'Страница',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Content',
  'UTM Term',
  'id'
];

// Дедуп идёт по столбцу «id» (последний). 1-based индекс.
const ID_COL = HEADERS.indexOf('id') + 1;

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.secret !== SECRET) {
      return json({ ok: false, error: 'forbidden' });
    }
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const sh =
      SpreadsheetApp.getActive().getSheetByName(SHEET_NAME) ||
      SpreadsheetApp.getActive().getSheets()[0];

    // Шапка: если лист пустой — создаём строку с названиями и закрепляем её.
    if (sh.getLastRow() === 0) {
      const head = sh.getRange(1, 1, 1, HEADERS.length);
      head.setValues([HEADERS]);
      head.setFontWeight('bold');
      sh.setFrozenRows(1);
    }

    // Дедуп по столбцу «id» (последний, ID_COL).
    const existing = {};
    const last = sh.getLastRow();
    if (last > 0) {
      sh.getRange(1, ID_COL, last, 1)
        .getValues()
        .forEach(function (r) {
          if (r[0] !== '') existing[String(r[0])] = true;
        });
    }

    let added = 0;
    rows.forEach(function (row) {
      const id = String(row[ID_COL - 1] || '');
      if (id && existing[id]) return; // уже есть — пропускаем
      const r = sh.getLastRow() + 1;
      const range = sh.getRange(r, 1, 1, row.length);
      range.setNumberFormat('@'); // весь ряд как текст: «+7…» не парсится в формулу (#ERROR!)
      range.setValues([row]);
      existing[id] = true;
      added++;
    });

    return json({ ok: true, added: added });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
