### Руководство по установке и запуску сервера ADB-MCP в Windows

Это руководство описывает процесс установки и запуска сервера ADB-MCP на операционной системе Windows. Сервер ADB-MCP позволяет AI/LLM взаимодействовать с приложениями Adobe, такими как Photoshop и Premiere Pro.

**Предварительные условия:**

Прежде чем начать, убедитесь, что у вас установлены следующие компоненты:

*   **Node.js:** Для работы прокси-сервера команд.
*   **Python 3:** Для работы сервера разработки MCP.
*   **uv:** Инструмент для управления пакетами Python. Вы можете установить его, следуя официальной документации `uv`.

    Если `uv` не установлен, вы можете установить его с помощью pip:
    ```bash
    pip install uv
    uv pip install mcp[cli]
    ```

#### Шаг 1: Настройка прокси-сервера команд Node.js

Этот сервер необходим для связи Claude с приложениями Adobe.

1.  Откройте командную строку или PowerShell.
2.  Перейдите в каталог `adb-proxy-socket` (этот каталог должен быть частью проекта `adb-mcp`):

    ```bash
    cd adb-proxy-socket
    ```
3.  Установите необходимые зависимости Node.js:

    ```bash
    npm install
    ```
4.  Запустите прокси-сервер:

    ```bash
    node proxy.js
    ```
    Вы должны увидеть сообщение, подтверждающее, что сервер запущен, например:
    ```
    adb-mcp Command proxy server running on ws://localhost:3001
    User connected: Ud6L4CjMWGAeofYAAAAB
    Client Ud6L4CjMWGAeofYAAAAB registered for application: photoshop
    ```
    (Источник: [https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_4](https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_4) и [https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_7](https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_7))

#### Шаг 2: Установка сервера MCP с зависимостями

Этот шаг устанавливает сервер MCP и все необходимые пакеты Python.

1.  Откройте новую командную строку или PowerShell (или используйте существующую, если прокси-сервер Node.js запущен в фоновом режиме).
2.  Перейдите в каталог `mcp` (этот каталог также должен быть частью проекта `adb-mcp`):

    ```bash
    cd mcp
    ```
3.  Установите сервер MCP для **Photoshop** со всеми необходимыми зависимостями:

    ```bash
    uv run mcp install --with fonttools --with python-socketio --with mcp --with requests --with websocket-client ps-mcp.py
    ```
    ИЛИ, если вы используете **Premiere**, установите сервер MCP со всеми необходимыми зависимостями:

    ```bash
    uv run mcp install --with fonttools --with python-socketio --with mcp --with requests --with websocket-client pr-mcp.py
    ```
    Эти команды гарантируют, что пакеты, такие как `fonttools`, `python-socketio`, `mcp`, `requests` и `websocket-client`, установлены для правильной работы сервера.
    (Источник: [https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_2](https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_2) и [https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_3](https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_3))

#### Шаг 3: Запуск сервера разработки MCP

После установки зависимостей вы можете запустить сервер разработки MCP.

1.  Убедитесь, что вы все еще находитесь в каталоге `mcp`.
2.  Для запуска MCP-сервера для **Photoshop**:

    ```bash
    uv run mcp dev ps-mcp.py
    ```
    ИЛИ, для запуска MCP-сервера для **Premiere**:

    ```bash
    uv run mcp dev pr-mcp.py
    ```
    Эти команды запускают сервер, который будет выступать в качестве интерфейса, предоставляя функциональные возможности Photoshop/Premiere для AI/LLM.
    (Источник: [https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_0](https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_0) и [https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_1](https://github.com/mikechambers/adb-mcp/blob/main/README.md#_snippet_1))

После выполнения этих шагов ваш сервер ADB-MCP должен быть настроен и запущен, готовый к взаимодействию с соответствующими приложениями Adobe.

### Adobe App Plugins

#### Photoshop
Включите режим разработчика в Photoshop:

1.  Запустите Photoshop (версия 26.0 или выше).
2.  Перейдите в _Настройки > Подключаемые модули_ и установите флажок _"Включить режим разработчика"_.
3.  Перезапустите Photoshop.

Из Creative Cloud Desktop установите и запустите "UXP Developer Tools". Когда появится запрос, включите режим разработчика.

Установите плагин:

1.  Выберите _Файл > Добавить плагин_.
2.  Перейдите в каталог _uxp/ps_ и выберите файл _manifest.json_.
3.  Как только плагин появится в списке, нажмите кнопку _"Загрузить"_.

Это должно загрузить плагин в Photoshop. Если вы его не видите, вы можете открыть его через меню плагинов в Photoshop.

#### Premiere

1.  Запустите Premiere Pro Beta (25.3)

Из Creative Cloud Desktop установите и запустите "UXP Developer Tools". Когда появится запрос, включите режим разработчика.

Установите плагин:

1.  Выберите _Файл > Добавить плагин_.
2.  Перейдите в каталог _uxp/pr_ и выберите файл _manifest.json_.
3.  Как только плагин появится в списке, нажмите кнопку _"Загрузить"_.

Это должно загрузить плагин в Premiere. Если вы его не видите, вы можете открыть его через меню плагинов в Premiere.

### Использование Claude с приложениями Adobe

Запустите следующее:

1.  Claude Desktop (или ваше AI-приложение, например, Cursor).
2.  Сервер узлов `adb-proxy-socket`.
3.  Запустите Photoshop и/или Premiere.

#### Photoshop
4.  Запустите UXP Developer Tool и нажмите кнопку _"Загрузить"_ для _Photoshop MCP Agent_.
5.  В Photoshop, если панель _MCP Agent_ не открыта, откройте _Плагины > Photoshop MCP Agent > Photoshop MCP Agent_.
6.  Нажмите _"Подключиться"_ в панели агента в Photoshop.

Теперь вы можете переключиться на Claude desktop. Прежде чем начать сеанс, вы должны загрузить ресурс инструкций, который предоставит рекомендации и информацию для Claude, нажав значок сокета (_Прикрепить из MCP_), а затем _"Выбрать интеграцию"_ > _"Adobe Photoshop"_ > _config://get_instructions_.

#### Premiere
4.  Запустите UXP Developer Tool и нажмите кнопку _"Загрузить"_ для _Premiere MCP Agent_.
5.  В Premiere, если панель _MCP Agent_ не открыта, откройте _Окно > UXP Plugins > Premiere MCP Agent > Premiere MCP Agent_.
6.  Нажмите _"Подключиться"_ в панели агента в Photoshop.

Теперь вы можете переключиться на Claude desktop. Прежде чем начать сеанс, вы должны загрузить ресурс инструкций, который предоставит рекомендации и информацию для Claude, нажав значок сокета (_Прикрепить из MCP_), а затем _"Выбрать интеграцию"_ > _"Adobe Premiere > _config://get_instructions_.

Примечание: вы должны перезагружать плагин через приложение UCP Developer каждый раз, когда перезапускаете Photoshop и Premiere.

### Настройка сеанса

В поле ввода чата нажмите кнопку _"Прикрепить из MCP"_ (выглядит как два сокета). Оттуда нажмите _"Выбрать интеграцию"_, а затем в _"Adobe Photoshop"_ или _"Adobe Premiere"_ выберите _*config://get_instructions*_. Это загрузит инструкции в подсказку. Отправьте их Claude, и как только он их обработает, вы готовы к работе.

<img src="images/claud-attach-mcp.png" width="600">

### Подсказки

В любое время вы можете спросить следующее:

```
Can you list what apis / functions are available for working with Photoshop / Premiere?
```

и он выведет все доступные функции.

При запросе вам не нужно ссылаться на API, просто используйте естественный язык для дачи инструкций.

Например:

```
Create a new Photoshop file with a blue background, that is 1080 width by 720 height at 300 dpi
```

```
Create a new Photoshop file for an instagram post
```

```
Create a double exposure image in Photoshop of a woman and a forest
```

```
Generate an image of a forest, and then add a clipping mask to only show the center in a circle
```
```
Make something cool with photoshop
```

```
Add cross fade transitions between all of the clips on the timeline in Premiere
```

```

### Советы

#### Общие
*   При запросе просите AI подумать и проверить свою работу.
*   Чем больше вы его направляете (например, "рассмотрите возможность использования обтравочных масок"), тем лучше результаты.
*   Чем более продвинутая модель или чем больше ресурсов выделяется модели, тем лучше и креативнее AI.
*   Как правило, не вносите изменения в приложения Adobe, пока AI работает. Если вы все же вносите изменения, обязательно сообщите об этом AI.
*   AI учится на своих ошибках, но теряет память после начала нового чата. Вы можете направить его делать что-то по-другому, а затем попросить начать заново, и он должен следовать новому подходу.

В настоящее время AI имеет доступ к подмножеству функций Photoshop / Premiere. В целом, подход заключался в предоставлении низкоуровневых инструментов, чтобы дать AI основы для выполнения более сложных задач.

Плагин Photoshop имеет больше функций, чем Premiere.

По умолчанию AI не может напрямую получать доступ к файлам, хотя если вы установите [Claude File System MCP server](https://www.claudemcp.com/servers/filesystem), он сможет получать доступ и загружать файлы в Photoshop / Premiere (открывать файлы и встраивать изображения).

#### Photoshop

*   Вы можете копировать и вставлять изображения из Photoshop в AI, чтобы дать ему больше информации о происходящем.
*   В настоящее время у AI есть проблемы с правильным изменением размера и позиционированием текста, поэтому предоставление рекомендаций по размерам шрифтов поможет, а также указание выравнивать текст относительно холста.
*   AI имеет доступ ко всем шрифтам Postscript в системе. Если вы хотите указать шрифт, вы должны использовать его имя Postscript (возможно, вы сможете узнать его у AI).
*   Вы можете попросить AI предложить варианты. Иногда он предлагает действительно полезные идеи / отзывы.

#### Premiere

*   В настоящее время плагин предполагает, что вы работаете только с одной последовательностью.

### Устранение неполадок

#### MCP не запускается в Claude

Если при запуске Claude вы получаете ошибку о том, что MCP не работает, вам может потребоваться отредактировать файл конфигурации Claude и указать абсолютный путь для команды UV. Дополнительная информация [здесь](https://github.com/mikechambers/adb-mcp/issues/5#issuecomment-2829817624).

#### Плагин не устанавливается или не подключается

*   Убедитесь, что приложение запущено, прежде чем пытаться загрузить плагин.
*   В инструменте разработчика UXP нажмите кнопку отладки рядом с кнопкой загрузки и посмотрите, нет ли ошибок.
*   Убедитесь, что сервер узлов / прокси-сервер запущен. Если ваш плагин подключается, вы должны увидеть вывод, аналогичный:

```
adb-mcp Command proxy server running on ws://localhost:3001
User connected: Ud6L4CjMWGAeofYAAAAB
Client Ud6L4CjMWGAeofYAAAAB registered for application: photoshop
```

*   При нажатии кнопки "Подключиться", если она по-прежнему отображает "Подключиться", это означает, что произошла либо ошибка, либо невозможно подключиться к прокси-серверу.

#### Ошибки в AI-клиенте

*   Если что-то не удается на стороне AI, он обычно сообщает вам о проблеме. Если вы нажмете командное / кодовое поле, вы увидите ошибку.
*   Первое, что нужно проверить, если есть проблема, это убедиться, что плагин в Photoshop / Premiere подключен и что прокси-сервер узлов запущен.
*   Если время отклика становится очень медленным, проверьте, не перегружены ли серверы AI и нет ли слишком много текста в текущем разговоре (перезапуск нового чата иногда может помочь ускорить работу, но вы потеряете контекст).

Если у вас по-прежнему возникают проблемы, оставьте [проблему]() на [Discord](https://discord.gg/fgxw9t37D7). Включите как можно больше информации (ОС, приложение, версия приложения и отладочная информация или ошибки).

### Разработка

Добавление новой функциональности относительно просто и требует:

1.  Добавления API и параметров в файл *mcp/ps-mcp.py* / *mcp/pr-mcp.py* (который используется AI)
2.  Реализации API в файле *uxp/ps/commands/index.js* / *uxp/pr/commands/index.js*.

TO BE COMPLETED

### Вопросы, запросы функций, обратная связь

Если у вас есть какие-либо вопросы, запросы функций, нужна помощь или вы просто хотите пообщаться, присоединяйтесь к [discord](https://discord.gg/fgxw9t37D7).

Вы также можете сообщать об ошибках и запросах функций на [странице проблем](https://github.com/mikechambers/adb-mcp/issues).

### Лицензия

Проект выпущен под [лицензией MIT](LICENSE.md).

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE.md)
