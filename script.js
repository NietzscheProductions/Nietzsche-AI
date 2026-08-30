/* =========================================================
   NIETZSCHE AI
   Nietzsche Productions
   Persistent Projects Edition
   Version 0.6
========================================================= */

let aiProcessing = false;


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://sotlnkobsnacifwkydok.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_HBtq5d-FoTrVzsAVQ0hBfQ_TTrLxtZb";

const NIETZSCHE_FUNCTION_URL =
    `${SUPABASE_URL}/functions/v1/nietzsche-ai`;


/* =========================================================
   SUPABASE CLIENT
========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   DEFAULT FILES
========================================================= */

const defaultFiles = {

    "index.html": {

        type: "html",

        content: `<!DOCTYPE html>
<html>

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>My Nietzsche Project</title>

</head>

<body>

    <h1>Hello from Nietzsche AI</h1>

    <p>
        Your project is running successfully.
    </p>

</body>

</html>`

    },


    "style.css": {

        type: "css",

        content: `body {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 50px;
}

h1 {
    color: #333;
}`

    },


    "script.js": {

        type: "js",

        content: `console.log("Nietzsche AI project loaded.");`

    }

};


/* =========================================================
   CURRENT PROJECT
========================================================= */

let currentProject = null;

let allProjects = [];

let currentFile = "index.html";

let files =
    JSON.parse(
        JSON.stringify(defaultFiles)
    );


/* =========================================================
   DOM ELEMENTS
========================================================= */

const codeEditor =
    document.getElementById("codeEditor");

const currentFileElement =
    document.getElementById("currentFile");

const currentFileIcon =
    document.getElementById("currentFileIcon");

const fileList =
    document.getElementById("fileList");

const projectList =
    document.getElementById("projectList");

const lineNumbers =
    document.getElementById("lineNumbers");

const preview =
    document.getElementById("preview");

const terminalOutput =
    document.getElementById("terminalOutput");

const chat =
    document.getElementById("chat");

const aiInput =
    document.getElementById("aiInput");

const agentActivity =
    document.getElementById("agentActivity");

const accountEmail =
    document.getElementById("accountEmail");

const signOutBtn =
    document.getElementById("signOutBtn");

const previewPanel =
    document.getElementById("previewPanel");

const togglePreview =
    document.getElementById("togglePreview");

const projectName =
    document.getElementById("projectName");

const sendBtn =
    document.getElementById("sendBtn");


/* =========================================================
   FILE TYPE
========================================================= */

function getFileType(filename) {

    if (filename.endsWith(".html")) {
        return "html";
    }

    if (filename.endsWith(".css")) {
        return "css";
    }

    if (filename.endsWith(".js")) {
        return "js";
    }

    if (filename.endsWith(".json")) {
        return "json";
    }

    if (filename.endsWith(".md")) {
        return "markdown";
    }

    return "text";

}


/* =========================================================
   FILE ICON
========================================================= */

function getFileIcon(filename) {

    if (filename.endsWith(".html")) {
        return "🌐";
    }

    if (filename.endsWith(".css")) {
        return "🎨";
    }

    if (filename.endsWith(".js")) {
        return "⚡";
    }

    if (filename.endsWith(".json")) {
        return "📦";
    }

    if (filename.endsWith(".md")) {
        return "📝";
    }

    return "📄";

}


/* =========================================================
   TERMINAL
========================================================= */

function addTerminalLine(
    text,
    type = ""
) {

    if (!terminalOutput) {
        return;
    }

    const line =
        document.createElement("div");

    line.textContent =
        text;

    if (type === "success") {

        line.className =
            "terminal-success";

    }

    terminalOutput.appendChild(line);

    terminalOutput.scrollTop =
        terminalOutput.scrollHeight;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;

}


/* =========================================================
   ADD FILE TO SIDEBAR
========================================================= */

function addFileToSidebar(filename) {

    if (!fileList) {
        return;
    }

    const existing =
        Array.from(
            fileList.querySelectorAll(".file")
        ).find(
            file =>
                file.dataset.file === filename
        );

    if (existing) {
        return;
    }

    const file =
        document.createElement("div");

    file.className =
        "file";

    file.dataset.file =
        filename;

    const icon =
        document.createElement("span");

    icon.textContent =
        getFileIcon(filename);

    const name =
        document.createElement("span");

    name.textContent =
        filename;

    file.appendChild(icon);

    file.appendChild(name);

    fileList.appendChild(file);

}


/* =========================================================
   REBUILD FILE SIDEBAR
========================================================= */

function rebuildFileSidebar() {

    if (!fileList) {
        return;
    }

    fileList.innerHTML = "";

    Object.keys(files).forEach(
        filename => {

            addFileToSidebar(
                filename
            );

        }
    );

}


/* =========================================================
   PROJECT SWITCHER
========================================================= */

function renderProjectList() {

    if (!projectList) {
        return;
    }

    projectList.innerHTML = "";

    if (
        !allProjects ||
        allProjects.length === 0
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "project-item loading";

        empty.textContent =
            "No projects yet.";

        projectList.appendChild(
            empty
        );

        return;

    }


    allProjects.forEach(
        project => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "project-item";

            if (
                currentProject &&
                project.id === currentProject.id
            ) {

                item.classList.add(
                    "active"
                );

            }

            item.dataset.projectId =
                project.id;

            item.textContent =
                `📁 ${project.name}`;

            item.addEventListener(
                "click",
                async () => {

                    await switchProject(
                        project.id
                    );

                }
            );

            projectList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   SWITCH PROJECT
========================================================= */

async function switchProject(projectId) {

    if (
        currentProject &&
        currentProject.id === projectId
    ) {

        return;

    }

    const selectedProject =
        allProjects.find(
            project =>
                project.id === projectId
        );

    if (!selectedProject) {

        addTerminalLine(
            "✗ Project not found."
        );

        return;

    }

    addTerminalLine(
        `Switching to "${selectedProject.name}"...`
    );


    if (currentProject) {

        const saved =
            await saveProject(false);

        if (!saved) {

            addTerminalLine(
                "✗ Current project could not be saved."
            );

            return;

        }

    }


    currentProject =
        selectedProject;


    files =
        currentProject.files &&
        typeof currentProject.files === "object"

            ? JSON.parse(
                JSON.stringify(
                    currentProject.files
                )
            )

            : JSON.parse(
                JSON.stringify(
                    defaultFiles
                )
            );


    if (
        Object.keys(files).length === 0
    ) {

        files =
            JSON.parse(
                JSON.stringify(
                    defaultFiles
                )
            );

    }


    currentFile =
        files["index.html"]
            ? "index.html"
            : Object.keys(files)[0];


    rebuildFileSidebar();

    loadFile(
        currentFile
    );

    updateProjectName();

    renderProjectList();

    buildPreview();


    addTerminalLine(
        `✓ Switched to "${currentProject.name}".`,
        "success"
    );

}


/* =========================================================
   LOAD FILE
========================================================= */

function loadFile(filename) {

    if (!files[filename]) {
        return;
    }

    currentFile =
        filename;

    codeEditor.value =
        files[filename].content;

    if (currentFileElement) {

        currentFileElement.textContent =
            filename;

    }

    if (currentFileIcon) {

        currentFileIcon.textContent =
            getFileIcon(filename);

    }

    updateLineNumbers();


    document
        .querySelectorAll(".file")
        .forEach(
            file => {

                file.classList.remove(
                    "active"
                );

                if (
                    file.dataset.file === filename
                ) {

                    file.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* =========================================================
   SAVE CURRENT FILE LOCALLY
========================================================= */

function saveCurrentFile() {

    if (!files[currentFile]) {
        return;
    }

    files[currentFile].content =
        codeEditor.value;

}


/* =========================================================
   SAVE PROJECT
========================================================= */

async function saveProject(
    showMessage = true
) {

    if (!currentProject) {

        return false;

    }

    saveCurrentFile();


    try {

        const {
            data: userData,
            error: userError
        } =
            await supabaseClient
                .auth
                .getUser();


        if (
            userError ||
            !userData.user
        ) {

            console.error(
                userError
            );

            return false;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("projects")
                .update({

                    files:
                        files,

                    updated_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    currentProject.id
                )
                .eq(
                    "user_id",
                    userData.user.id
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Project save error:",
                error
            );

            addTerminalLine(
                `✗ Could not save project: ${error.message}`
            );

            return false;

        }


        if (data) {

            currentProject =
                data;

            const index =
                allProjects.findIndex(
                    project =>
                        project.id === data.id
                );

            if (index !== -1) {

                allProjects[index] =
                    data;

            }

        }


        if (showMessage) {

            addTerminalLine(
                "✓ Project saved.",
                "success"
            );

        }


        return true;

    }

    catch (error) {

        console.error(
            "Save project error:",
            error
        );

        return false;

    }

}


/* =========================================================
   LOAD PROJECTS
========================================================= */

async function loadProjects() {

    addTerminalLine(
        "Loading projects..."
    );


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (
        userError ||
        !userData.user
    ) {

        addTerminalLine(
            "✗ No signed-in user."
        );

        return;

    }


    const {
        data: projects,
        error
    } =
        await supabaseClient
            .from("projects")
            .select("*")
            .eq(
                "user_id",
                userData.user.id
            )
            .order(
                "updated_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Project loading error:",
            error
        );

        addTerminalLine(
            `✗ Could not load projects: ${error.message}`
        );

        return;

    }


    allProjects =
        projects || [];


    if (
        allProjects.length === 0
    ) {

        await createProject(
            "My First Project"
        );

        return;

    }


    currentProject =
        allProjects[0];


    files =
        currentProject.files &&
        typeof currentProject.files === "object"

            ? JSON.parse(
                JSON.stringify(
                    currentProject.files
                )
            )

            : JSON.parse(
                JSON.stringify(
                    defaultFiles
                )
            );


    if (
        Object.keys(files).length === 0
    ) {

        files =
            JSON.parse(
                JSON.stringify(
                    defaultFiles
                )
            );

    }


    currentFile =
        files["index.html"]
            ? "index.html"
            : Object.keys(files)[0];


    rebuildFileSidebar();

    loadFile(
        currentFile
    );

    updateProjectName();

    renderProjectList();


    addTerminalLine(
        `✓ Loaded "${currentProject.name}".`,
        "success"
    );

}


/* =========================================================
   CREATE PROJECT
========================================================= */

async function createProject(name) {

    const cleanName =
        String(name || "").trim();

    if (!cleanName) {
        return;
    }


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "You must be signed in to create a project."
        );

        return;

    }


    if (currentProject) {

        await saveProject(false);

    }


    const newProjectFiles =
        JSON.parse(
            JSON.stringify(
                defaultFiles
            )
        );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("projects")
            .insert({

                user_id:
                    userData.user.id,

                name:
                    cleanName,

                files:
                    newProjectFiles

            })
            .select()
            .single();


    if (error) {

        console.error(
            "Create project error:",
            error
        );

        addTerminalLine(
            `✗ Could not create project: ${error.message}`
        );

        return;

    }


    currentProject =
        data;

    allProjects.unshift(
        data
    );


    files =
        JSON.parse(
            JSON.stringify(
                newProjectFiles
            )
        );


    currentFile =
        "index.html";


    rebuildFileSidebar();

    loadFile(
        currentFile
    );

    updateProjectName();

    renderProjectList();

    buildPreview();


    addTerminalLine(
        `✓ Created "${cleanName}".`,
        "success"
    );

}


/* =========================================================
   UPDATE PROJECT NAME
========================================================= */

function updateProjectName() {

    if (
        projectName &&
        currentProject
    ) {

        projectName.textContent =
            currentProject.name;

    }

}


/* =========================================================
   LINE NUMBERS
========================================================= */

function updateLineNumbers() {

    if (
        !lineNumbers ||
        !codeEditor
    ) {

        return;

    }

    const lines =
        codeEditor.value
            .split("\n")
            .length;

    let numbers = "";

    for (
        let i = 1;
        i <= lines;
        i++
    ) {

        numbers +=
            i + "\n";

    }

    lineNumbers.textContent =
        numbers;

}


/* =========================================================
   EXTRACT BODY
========================================================= */

function extractBody(html) {

    const match =
        html.match(
            /<body[^>]*>([\s\S]*?)<\/body>/i
        );

    const body =
        match
            ? match[1]
            : html;


    /* =========================================================
       STRIP LOCAL <script src="..."> TAGS

       buildPreview() already inlines the project's script.js
       content directly into its own <script> block below, so any
       <script src="script.js"> (or similar local reference) left
       over from the file's own markup is redundant.

       Worse: since the preview renders via iframe.srcdoc (which
       has no URL of its own), a relative src like "script.js"
       resolves against the REAL page's URL instead of the
       project's files -- meaning a leftover script tag can
       accidentally load the live app's own script.js inside the
       preview sandbox. Stripping local script tags here prevents
       that entirely. Scripts with a full http(s) URL (external
       libraries/CDNs) are left untouched.
    ========================================================= */

    return body.replace(
        /<script\b(?![^>]*\bsrc\s*=\s*["']https?:\/\/)[^>]*\bsrc\s*=\s*["'][^"']*["'][^>]*>\s*<\/script>/gi,
        ""
    );

}


/* =========================================================
   BUILD PREVIEW
========================================================= */

function buildPreview() {

    saveCurrentFile();


    const html =
        files["index.html"]

            ? files["index.html"].content

            : "<h1>No index.html found.</h1>";


    const css =
        files["style.css"]

            ? files["style.css"].content

            : "";


    const js =
        files["script.js"]

            ? files["script.js"].content

            : "";


    const documentContent =
`<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<style>

${css}

</style>

</head>

<body>

${extractBody(html)}

<script>

${js}

<\/script>

</body>

</html>`;


    if (preview) {

        preview.srcdoc =
            documentContent;

    }


    addTerminalLine(
        "▶ Starting preview..."
    );


    setTimeout(
        () => {

            addTerminalLine(
                "✓ Preview running.",
                "success"
            );

        },
        300
    );

}


/* =========================================================
   CHAT MESSAGE
========================================================= */

function addMessage(
    sender,
    text,
    type = "ai"
) {

    if (!chat) {
        return;
    }

    const message =
        document.createElement("div");

    message.className =
        `message ${type}-message`;


    message.innerHTML =
        `<div class="message-label">
            ${escapeHTML(sender)}
        </div>

        <div class="message-content">
            ${text}
        </div>`;


    chat.appendChild(
        message
    );

    chat.scrollTop =
        chat.scrollHeight;

}


/* =========================================================
   AGENT ACTIVITY
========================================================= */

function addActivity(
    text,
    completed = false
) {

    if (!agentActivity) {
        return;
    }

    const item =
        document.createElement("div");

    item.className =
        `activity-item ${
            completed
                ? "completed"
                : ""
        }`;


    item.innerHTML =
        `<span>
            ${completed ? "✓" : "○"}
        </span>

        <span>
            ${escapeHTML(text)}
        </span>`;


    agentActivity.appendChild(
        item
    );

}


/* =========================================================
   AI REQUEST
========================================================= */

async function processAIRequest(request) {

    if (aiProcessing) {
        return;
    }


    aiProcessing = true;


    if (aiInput) {
        aiInput.disabled = true;
    }

    if (sendBtn) {
        sendBtn.disabled = true;
    }


    addMessage(
        "You",
        escapeHTML(request),
        "user"
    );


    if (agentActivity) {

        agentActivity.innerHTML = "";

    }


    function createActivity(text) {

        const item =
            document.createElement("div");

        item.className =
            "activity-item";


        item.innerHTML = `
            <span class="activity-status">
                ○
            </span>

            <span>
                ${escapeHTML(text)}
            </span>
        `;


        if (agentActivity) {

            agentActivity.appendChild(
                item
            );

        }


        return item;

    }


    function completeActivity(item) {

        if (!item) {
            return;
        }


        item.classList.add(
            "completed"
        );


        const status =
            item.querySelector(
                ".activity-status"
            );


        if (status) {

            status.textContent =
                "✓";

        }

    }


    const analyzingActivity =
        createActivity(
            "Analyzing request"
        );


    let thinkingMessage = null;


    if (chat) {

        thinkingMessage =
            document.createElement("div");

        thinkingMessage.className =
            "message ai-message thinking-message";


        thinkingMessage.innerHTML = `
            <div class="message-label">
                Nietzsche
            </div>

            <div class="message-content">
                <span class="thinking-dots">
                    Thinking<span>.</span><span>.</span><span>.</span>
                </span>
            </div>
        `;


        chat.appendChild(
            thinkingMessage
        );


        chat.scrollTop =
            chat.scrollHeight;

    }


    try {

        completeActivity(
            analyzingActivity
        );


        const inspectingActivity =
            createActivity(
                "Inspecting project files"
            );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );


        completeActivity(
            inspectingActivity
        );


        const planningActivity =
            createActivity(
                "Sending request to Nietzsche..."
            );


        addTerminalLine(
            "→ Sending AI request..."
        );


        /* =============================================
           AI REQUEST
        ============================================= */

        const {
            data: sessionData
        } =
            await supabaseClient
                .auth
                .getSession();


        if (
            !sessionData.session
        ) {

            throw new Error(
                "You must be signed in to use the AI agent."
            );

        }


        const response =
            await fetch(
                NIETZSCHE_FUNCTION_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_PUBLISHABLE_KEY,

                        "Authorization":
                            `Bearer ${sessionData.session.access_token}`

                    },

                    body:
                        JSON.stringify({

                            message:
                                request,

                            files:
                                files

                        })

                }
            );


        let result;


        try {

            result =
                await response.json();

        }

        catch {

            throw new Error(
                `AI server returned invalid data (HTTP ${response.status}).`
            );

        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                `Nietzsche AI server error (HTTP ${response.status}).`
            );

        }


        completeActivity(
            planningActivity
        );


        addTerminalLine(
            "✓ AI response received.",
            "success"
        );


        /* =============================================
           REMOVE THINKING MESSAGE
        ============================================= */

        if (thinkingMessage) {

            thinkingMessage.remove();

            thinkingMessage =
                null;

        }


        /* =============================================
           PLAN
        ============================================= */

        if (
            Array.isArray(result.plan) &&
            result.plan.length > 0
        ) {

            const planHTML =
                result.plan
                    .map(
                        (step, index) =>
                            `${index + 1}. ${escapeHTML(step)}`
                    )
                    .join(
                        "<br>"
                    );


            addMessage(
                "Nietzsche",
                `<strong>Plan</strong><br><br>${planHTML}`,
                "ai"
            );

        }


        /* =============================================
           FILE CHANGES
        ============================================= */

        const changedFiles = [];


        if (
            Array.isArray(result.changes)
        ) {

            result.changes.forEach(
                change => {

                    if (
                        !change ||
                        !change.filename
                    ) {

                        return;

                    }


                    const filename =
                        String(
                            change.filename
                        );


                    const updatingActivity =
                        createActivity(
                            `Updating ${filename}`
                        );


                    files[filename] = {

                        type:
                            getFileType(
                                filename
                            ),

                        content:
                            String(
                                change.content ??
                                ""
                            )

                    };


                    changedFiles.push(
                        filename
                    );


                    completeActivity(
                        updatingActivity
                    );

                }
            );

        }


        rebuildFileSidebar();


        if (files[currentFile]) {

            loadFile(
                currentFile
            );

        }


        /* =============================================
           AI MESSAGE
        ============================================= */

        if (result.message) {

            addMessage(
                "Nietzsche",
                escapeHTML(
                    result.message
                ),
                "ai"
            );

        }


        /* =============================================
           SAVE + PREVIEW
        ============================================= */

        if (
            changedFiles.length > 0
        ) {

            const previewActivity =
                createActivity(
                    "Updating live preview"
                );


            buildPreview();


            completeActivity(
                previewActivity
            );


            const savingActivity =
                createActivity(
                    "Saving project"
                );


            const saved =
                await saveProject(
                    false
                );


            if (saved) {

                completeActivity(
                    savingActivity
                );

            }
            else {

                savingActivity.classList.add(
                    "error"
                );

                const status =
                    savingActivity.querySelector(
                        ".activity-status"
                    );

                if (status) {
                    status.textContent =
                        "✕";
                }

            }


            const completeItem =
                createActivity(
                    `Complete — updated ${changedFiles.length} file(s)`
                );


            completeActivity(
                completeItem
            );


            addTerminalLine(
                `✓ Nietzsche updated: ${changedFiles.join(", ")}`,
                "success"
            );

        }

        else {

            const completeItem =
                createActivity(
                    "Complete — no file changes needed"
                );


            completeActivity(
                completeItem
            );

        }

    }


    catch (error) {

        console.error(
            "Nietzsche AI error:",
            error
        );


        if (thinkingMessage) {

            thinkingMessage.remove();

            thinkingMessage =
                null;

        }


        const errorMessage =
            error instanceof Error
                ? error.message
                : String(error);


        addMessage(
            "Nietzsche",
            `Error: ${escapeHTML(errorMessage)}`,
            "ai"
        );


        const errorActivity =
            createActivity(
                `Error: ${errorMessage}`
            );


        errorActivity.classList.add(
            "error"
        );


        const status =
            errorActivity.querySelector(
                ".activity-status"
            );


        if (status) {

            status.textContent =
                "✕";

        }


        addTerminalLine(
            `✗ AI Error: ${errorMessage}`
        );

    }


    finally {

        if (thinkingMessage) {

            thinkingMessage.remove();

        }


        aiProcessing =
            false;


        if (aiInput) {

            aiInput.disabled =
                false;

            aiInput.focus();

        }


        if (sendBtn) {

            sendBtn.disabled =
                false;

        }

    }

}


/* =========================================================
   FILE CLICKING
========================================================= */

if (fileList) {

    fileList.addEventListener(
        "click",
        event => {

            const file =
                event.target.closest(
                    ".file"
                );

            if (!file) {
                return;
            }

            loadFile(
                file.dataset.file
            );

        }
    );

}


/* =========================================================
   EDITOR INPUT
========================================================= */

if (codeEditor) {

    codeEditor.addEventListener(
        "input",
        () => {

            if (files[currentFile]) {

                files[currentFile].content =
                    codeEditor.value;

            }

            updateLineNumbers();

        }
    );

}


/* =========================================================
   RUN
========================================================= */

const runBtn =
    document.getElementById(
        "runBtn"
    );


if (runBtn) {

    runBtn.addEventListener(
        "click",
        async () => {

            buildPreview();

            await saveProject(false);

        }
    );

}


/* =========================================================
   REFRESH PREVIEW
========================================================= */

const refreshPreview =
    document.getElementById(
        "refreshPreview"
    );


if (refreshPreview) {

    refreshPreview.addEventListener(
        "click",
        buildPreview
    );

}


/* =========================================================
   SAVE BUTTON
========================================================= */

const saveBtn =
    document.getElementById(
        "saveBtn"
    );


if (saveBtn) {

    saveBtn.addEventListener(
        "click",
        async () => {

            await saveProject(
                true
            );

        }
    );

}


/* =========================================================
   CLEAR TERMINAL
========================================================= */

const clearTerminal =
    document.getElementById(
        "clearTerminal"
    );


if (clearTerminal) {

    clearTerminal.addEventListener(
        "click",
        () => {

            if (terminalOutput) {

                terminalOutput.innerHTML =
                    "";

            }

        }
    );

}


/* =========================================================
   SEND AI
========================================================= */

function sendAIMessage() {

    if (!aiInput) {
        return;
    }


    if (aiProcessing) {
        return;
    }


    const request =
        aiInput.value.trim();


    if (!request) {
        return;
    }


    aiInput.value =
        "";


    processAIRequest(
        request
    );

}


if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendAIMessage
    );

}


/* =========================================================
   ENTER TO SEND
========================================================= */

if (aiInput) {

    aiInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendAIMessage();

            }

        }
    );

}


/* =========================================================
   NEW FILE
========================================================= */

const fileModal =
    document.getElementById(
        "fileModal"
    );

const newFileName =
    document.getElementById(
        "newFileName"
    );

const newFileBtn =
    document.getElementById(
        "newFileBtn"
    );

const cancelFile =
    document.getElementById(
        "cancelFile"
    );

const createFileBtn =
    document.getElementById(
        "createFile"
    );


if (newFileBtn) {

    newFileBtn.addEventListener(
        "click",
        () => {

            if (fileModal) {

                fileModal.classList.add(
                    "show"
                );

            }

            if (newFileName) {

                newFileName.focus();

            }

        }
    );

}


if (cancelFile) {

    cancelFile.addEventListener(
        "click",
        () => {

            if (fileModal) {

                fileModal.classList.remove(
                    "show"
                );

            }

            if (newFileName) {

                newFileName.value =
                    "";

            }

        }
    );

}


/* =========================================================
   CREATE FILE
========================================================= */

function createNewFile() {

    if (!newFileName) {
        return;
    }


    const filename =
        newFileName.value.trim();


    if (!filename) {

        alert(
            "Please enter a filename."
        );

        return;

    }


    if (files[filename]) {

        alert(
            "A file with that name already exists."
        );

        return;

    }


    files[filename] = {

        type:
            getFileType(filename),

        content:
            ""

    };


    rebuildFileSidebar();


    if (fileModal) {

        fileModal.classList.remove(
            "show"
        );

    }


    newFileName.value =
        "";


    loadFile(
        filename
    );


    addTerminalLine(
        `✓ Created ${filename}`,
        "success"
    );


    saveProject(false);

}


if (createFileBtn) {

    createFileBtn.addEventListener(
        "click",
        createNewFile
    );

}


if (newFileName) {

    newFileName.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                createNewFile();

            }

        }
    );

}


/* =========================================================
   NEW PROJECT
========================================================= */

async function askForNewProject() {

    const name =
        prompt(
            "Enter your project name:"
        );


    if (!name) {
        return;
    }


    await createProject(
        name.trim()
    );

}


const newProjectBtn =
    document.getElementById(
        "newProjectBtn"
    );


if (newProjectBtn) {

    newProjectBtn.addEventListener(
        "click",
        askForNewProject
    );

}


const newProjectSidebarBtn =
    document.getElementById(
        "newProjectSidebarBtn"
    );


if (newProjectSidebarBtn) {

    newProjectSidebarBtn.addEventListener(
        "click",
        askForNewProject
    );

}


/* =========================================================
   SETTINGS
========================================================= */

const settingsBtn =
    document.getElementById(
        "settingsBtn"
    );


if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        () => {

            addMessage(
                "Nietzsche",
                "Settings will be added in a future version.",
                "ai"
            );

        }
    );

}


/* =========================================================
   PREVIEW TOGGLE
========================================================= */

if (
    togglePreview &&
    previewPanel
) {

    togglePreview.addEventListener(
        "click",
        () => {

            previewPanel.classList.toggle(
                "collapsed"
            );


            const isCollapsed =
                previewPanel.classList.contains(
                    "collapsed"
                );


            togglePreview.classList.toggle(
                "is-collapsed",
                isCollapsed
            );

        }
    );

}


/* =========================================================
   ACCOUNT
========================================================= */

async function loadAccount() {

    if (!accountEmail) {
        return false;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (error) {

            console.error(error);

            accountEmail.textContent =
                "Auth Error";

            return false;

        }


        if (!data.session) {

            window.location.href =
                "login.html";

            return false;

        }


        accountEmail.textContent =
            data.session.user.email;

        accountEmail.title =
            data.session.user.email;


        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}


/* =========================================================
   SIGN OUT
========================================================= */

if (signOutBtn) {

    signOutBtn.addEventListener(
        "click",
        async () => {

            signOutBtn.disabled =
                true;

            signOutBtn.textContent =
                "Signing out...";


            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (error) {

                console.error(error);

                signOutBtn.disabled =
                    false;

                signOutBtn.textContent =
                    "Sign Out";

                return;

            }


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
    (
        event,
        session
    ) => {

        if (
            event === "SIGNED_OUT"
        ) {

            window.location.href =
                "login.html";

            return;

        }


        if (
            session &&
            accountEmail
        ) {

            accountEmail.textContent =
                session.user.email;

        }

    }
);


/* =========================================================
   PROJECTS MODAL
========================================================= */

const projectsBtn =
    document.getElementById(
        "projectsBtn"
    );

const projectsModal =
    document.getElementById(
        "projectsModal"
    );

const closeProjectsBtn =
    document.getElementById(
        "closeProjectsBtn"
    );

const projectsList =
    document.getElementById(
        "projectsList"
    );


/* =========================================================
   OPEN PROJECTS MODAL
========================================================= */

if (projectsBtn) {

    projectsBtn.addEventListener(
        "click",
        async () => {

            if (projectsModal) {

                projectsModal.classList.add(
                    "show"
                );

            }

            await renderProjectsList();

        }
    );

}


/* =========================================================
   CLOSE PROJECTS MODAL
========================================================= */

if (closeProjectsBtn) {

    closeProjectsBtn.addEventListener(
        "click",
        () => {

            if (projectsModal) {

                projectsModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   CLOSE OUTSIDE MODAL
========================================================= */

if (projectsModal) {

    projectsModal.addEventListener(
        "click",
        event => {

            if (
                event.target === projectsModal
            ) {

                projectsModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   RENDER PROJECTS
========================================================= */

async function renderProjectsList() {

    if (!projectsList) {
        return;
    }


    projectsList.innerHTML = `
        <div class="projects-loading">
            Loading projects...
        </div>
    `;


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (
        userError ||
        !userData.user
    ) {

        projectsList.innerHTML = `
            <div class="projects-empty">
                You are not signed in.
            </div>
        `;

        return;

    }


    const {
        data: projects,
        error
    } =
        await supabaseClient
            .from("projects")
            .select("*")
            .eq(
                "user_id",
                userData.user.id
            )
            .order(
                "updated_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Could not load projects:",
            error
        );


        projectsList.innerHTML = `
            <div class="projects-empty">
                Could not load projects.
            </div>
        `;

        return;

    }


    if (
        !projects ||
        projects.length === 0
    ) {

        projectsList.innerHTML = `
            <div class="projects-empty">
                No projects yet.
            </div>
        `;

        return;

    }


    projectsList.innerHTML = "";


    projects.forEach(
        project => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "project-item";


            if (
                currentProject &&
                project.id ===
                currentProject.id
            ) {

                item.classList.add(
                    "active-project"
                );

            }


            const updatedDate =
                project.updated_at
                    ? new Date(
                        project.updated_at
                    ).toLocaleString()
                    : "Unknown";


            item.innerHTML = `

                <div class="project-info">

                    <div class="project-title">
                        ${escapeHTML(
                            project.name
                        )}
                    </div>

                    <div class="project-date">
                        Last updated:
                        ${escapeHTML(
                            updatedDate
                        )}
                    </div>

                </div>


                <div class="project-actions">

                    <button class="open-project-btn">
                        Open
                    </button>

                    <button class="rename-project-btn">
                        Rename
                    </button>

                    <button class="delete-project-btn">
                        Delete
                    </button>

                </div>

            `;


            item
                .querySelector(
                    ".open-project-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        openProject(
                            project
                        );

                    }
                );


            item
                .querySelector(
                    ".project-info"
                )
                .addEventListener(
                    "click",
                    () => {

                        openProject(
                            project
                        );

                    }
                );


            item
                .querySelector(
                    ".rename-project-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        renameProject(
                            project
                        );

                    }
                );


            item
                .querySelector(
                    ".delete-project-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        deleteProject(
                            project
                        );

                    }
                );


            projectsList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   OPEN PROJECT
========================================================= */

async function openProject(project) {

    if (!project) {
        return;
    }


    if (currentProject) {

        await saveProject(false);

    }


    currentProject =
        project;


    files =
        project.files &&
        typeof project.files === "object"

            ? JSON.parse(
                JSON.stringify(
                    project.files
                )
            )

            : JSON.parse(
                JSON.stringify(
                    defaultFiles
                )
            );


    if (files["index.html"]) {

        currentFile =
            "index.html";

    }

    else {

        currentFile =
            Object.keys(files)[0] ||
            "index.html";

    }


    rebuildFileSidebar();


    if (files[currentFile]) {

        loadFile(
            currentFile
        );

    }


    updateProjectName();

    renderProjectList();

    buildPreview();


    if (projectsModal) {

        projectsModal.classList.remove(
            "show"
        );

    }


    addTerminalLine(
        `✓ Opened project "${project.name}".`,
        "success"
    );


    addMessage(
        "Nietzsche",
        `Opened <strong>${escapeHTML(
            project.name
        )}</strong>.`,
        "ai"
    );

}


/* =========================================================
   RENAME PROJECT
========================================================= */

async function renameProject(project) {

    if (!project) {
        return;
    }


    const newName =
        prompt(
            "Enter a new project name:",
            project.name
        );


    if (!newName) {
        return;
    }


    const trimmedName =
        newName.trim();


    if (!trimmedName) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("projects")
            .update({

                name:
                    trimmedName,

                updated_at:
                    new Date()
                        .toISOString()

            })
            .eq(
                "id",
                project.id
            );


    if (error) {

        console.error(
            "Rename project error:",
            error
        );


        alert(
            `Could not rename the project: ${error.message}`
        );

        return;

    }


    if (
        currentProject &&
        currentProject.id === project.id
    ) {

        currentProject.name =
            trimmedName;

        updateProjectName();

    }


    const projectIndex =
        allProjects.findIndex(
            item =>
                item.id === project.id
        );


    if (projectIndex !== -1) {

        allProjects[projectIndex].name =
            trimmedName;

    }


    addTerminalLine(
        `✓ Renamed project to "${trimmedName}".`,
        "success"
    );


    await renderProjectsList();

}


/* =========================================================
   DELETE PROJECT
========================================================= */

async function deleteProject(project) {

    if (!project) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${project.name}"?\n\nThis cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "You must be signed in."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("projects")
            .delete()
            .eq(
                "id",
                project.id
            )
            .eq(
                "user_id",
                userData.user.id
            );


    if (error) {

        console.error(
            "Delete project error:",
            error
        );


        alert(
            `Could not delete the project: ${error.message}`
        );

        return;

    }


    allProjects =
        allProjects.filter(
            item =>
                item.id !== project.id
        );


    addTerminalLine(
        `✓ Deleted project "${project.name}".`,
        "success"
    );


    if (
        currentProject &&
        currentProject.id === project.id
    ) {

        currentProject =
            null;


        files =
            JSON.parse(
                JSON.stringify(
                    defaultFiles
                )
            );


        currentFile =
            "index.html";


        await loadProjects();

        buildPreview();

    }


    renderProjectList();

    await renderProjectsList();

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initialize() {

    addTerminalLine(
        "Nietzsche AI Development Environment"
    );


    addTerminalLine(
        "Connecting to Supabase..."
    );


    const signedIn =
        await loadAccount();


    if (!signedIn) {
        return;
    }


    await loadProjects();


    buildPreview();

    updateLineNumbers();


    console.log(
        "Nietzsche AI initialized successfully."
    );

}


initialize();