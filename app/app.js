// R.S.S., 2026

import pug from "pug";

//Логинка, да-да, хардуем, плохо, но требований иных вроде не было?:)
const LOGIN = "c2e496ce-6da7-4285-9c80-f8b7c2a444c3";


/**
 * Вспомогательная функция для загрузки pug-шаблона по URL.
 * Используется в маршруте /render/.
 * 
 * @param {string} url - адрес удалённого pug-шаблона
 * @returns {Promise<string>} - исходный текст шаблона
 * 
 * Боже, храни средства автоматизированного создания такой бяки в документации...
 */
async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Template fetch failed: ${res.status}`);
  return await res.text();
}


//Основная логика прилки
export default (express, bodyParser, createReadStream, crypto, http, CORS, writeFileSync) => {
  const app = express();

  //Корсики
  app.use(CORS());
  app.use(bodyParser.json({ type: "application/json" }));

  // Логинка (ну типа)
  // /login/
  app.get("/login/", (req, res) => {
    res.type("text/plain").send(LOGIN);
  });

  /**
   * Маршрут /render/
   * 
   * Принимает:
   *  - POST-запрос
   *  - Content-Type: application/json
   *  - тело с полями random2 и random3
   *  - query-параметр addr (URL на pug-шаблон)
   *
   * Выполняет:
   *  - загрузку pug-шаблона по addr
   *  - рендер шаблона с переданными данными
   *  - возврат HTML-разметки
   */

  // /render/?addr=URL + POST JSON {"random2":"...","random3":"..."}
  app.post("/render/", async (req, res) => {
    try {
      const addr = req.query.addr;

      //Типо защищаем
      if (!addr) {
        return res.status(400).type("text/plain").send("Missing query param: addr");
      }

      const { random2, random3 } = req.body || {};
      if (typeof random2 !== "string" || typeof random3 !== "string") {
        return res.status(400).type("text/plain").send("Body must be JSON with string fields random2 and random3");
      }

      //Грузим шаблончик
      const pugSource = await fetchText(addr);

      //Рендерим
      const html = pug.render(pugSource, { random2, random3 });

      //Лови, юзверь!
      res.status(200).type("text/html; charset=utf-8").send(html);

    } catch (e) {
      res.status(500).type("text/plain").send(String(e?.message || e));
    }
  });

  //Ну обязательно же кто-то гет сделает...
  app.get("/render/", (req, res) => {
    res.status(405).type("text/plain").send("Use POST with application/json");
  });

  return app;

};