### Руководство по установке и запуску сервера ADB-MCP в Windows

Это руководство описывает процесс установки и запуска сервера ADB-MCP на операционной системе Windows. Сервер ADB-MCP позволяет AI/LLM взаимодействовать с приложениями Adobe, такими как Photoshop и Premiere Pro.

**Предварительные условия:**

Прежде чем начать, убедитесь, что у вас установлены следующие компоненты:

*   **Node.js:** Для работы прокси-сервера команд.
*   **Python 3:** Для работы сервера разработки MCP.
*   **uv:** Инструмент для управления пакетами Python. Вы можете установить его, следуя официальной документации `uv`.

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
