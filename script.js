-- UI Library - RN TEAM (versão melhorada)
--
-- Exemplo de uso:
--   RNUI:Init({Title = "RN TEAM", Credits = "YouTube: RN_TEAM"})
--   RNUI:Toggle("Auto Parry", false, function(v) print(v) end, "AutoParry")   -- 4º parâmetro = flag (salva a config)
--   RNUI:Dropdown("Modo", {"A", "B"}, "A", function(v) print(v) end, "Modo")
--   RNUI:TextBox("Delay", "0.5", function(texto, enter) print(texto) end, "Delay")
--
-- Todas as chamadas antigas continuam funcionando; os parâmetros novos são opcionais.

local RNUI = {}

-- Serviços
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local HttpService = game:GetService("HttpService")

local LocalPlayer = Players.LocalPlayer

local GUI_NAME = "RNUI_RN_TEAM"

-- Tema
local THEME = {
    Window = Color3.fromRGB(20, 20, 20),
    Title = Color3.fromRGB(30, 30, 30),
    Element = Color3.fromRGB(50, 50, 50),
    ElementHover = Color3.fromRGB(70, 70, 70),
    ElementPress = Color3.fromRGB(35, 35, 35),
    Option = Color3.fromRGB(60, 60, 60),
    OptionHover = Color3.fromRGB(80, 80, 80),
    OptionPress = Color3.fromRGB(45, 45, 45),
    List = Color3.fromRGB(40, 40, 40),
    Accent = Color3.fromRGB(0, 170, 255),
    Off = Color3.fromRGB(40, 40, 40),
    Text = Color3.fromRGB(255, 255, 255),
    SubText = Color3.fromRGB(200, 200, 200),
    Placeholder = Color3.fromRGB(150, 150, 150),
    Line = Color3.fromRGB(60, 60, 60),
}

-- Medidas
local HEADER = 34
local FOOTER = 26
local SIDE_PAD = 6
local CONTENT_TOP = HEADER + 4
local CHROME = CONTENT_TOP + FOOTER + 2 -- altura da janela que não é conteúdo
local MIN_HEIGHT, MAX_HEIGHT = 220, 400
local OPTION_H, LIST_MAX_H = 32, 150

-- Estado
local ScreenGui, MainFrame, ScrollFrame, UIListLayout, MinimizeButton
local Connections = {}     -- conexões globais (UserInputService), desconectadas no Destroy
local Dropdowns = {}       -- funções que fecham cada dropdown
local Flags = {}           -- valores salvos (config persistente)
local persist = true
local saveFile = "RNUI_Config.json"
local saveQueued = false
local layoutOrder = 0
local windowWidth = 250
local expandedHeight = MIN_HEIGHT
local isMinimized = false
local sizeTween

----------------------------------------------------------------------
-- Utilitários
----------------------------------------------------------------------

local function create(className, props, parent)
    local inst = Instance.new(className)
    for k, v in pairs(props) do
        inst[k] = v
    end
    inst.Parent = parent
    return inst
end

local function corner(parent, radius)
    return create("UICorner", {CornerRadius = UDim.new(0, radius)}, parent)
end

local function tween(object, duration, properties)
    local t = TweenService:Create(
        object,
        TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
        properties
    )
    t:Play()
    return t
end

-- Executa callbacks sem derrubar a UI se o código do usuário der erro
local function safeCall(fn, label, ...)
    if type(fn) ~= "function" then return end
    local ok, err = pcall(fn, ...)
    if not ok then
        warn(("[RNUI] erro no callback de %s: %s"):format(tostring(label), tostring(err)))
    end
end

local function nextOrder()
    layoutOrder += 1
    return layoutOrder
end

local function ready()
    if not (ScreenGui and MainFrame and ScrollFrame) then
        warn("[RNUI] UI não inicializada. Chame RNUI:Init() primeiro.")
        return false
    end
    return true
end

local function connect(signal, fn)
    local c = signal:Connect(fn)
    table.insert(Connections, c)
    return c
end

-- Remove opções repetidas mantendo a ordem
local function dedupe(list)
    local result, seen = {}, {}
    for _, value in ipairs(list or {}) do
        local key = tostring(value)
        if not seen[key] then
            seen[key] = true
            table.insert(result, value)
        end
    end
    return result
end

-- Efeito de hover (mouse) e de toque (celular) sem "grudar" a cor
local function bindFX(button, normal, hover, press)
    local hovering = false

    button.MouseEnter:Connect(function()
        hovering = true
        tween(button, 0.12, {BackgroundColor3 = hover})
    end)

    button.MouseLeave:Connect(function()
        hovering = false
        tween(button, 0.12, {BackgroundColor3 = normal})
    end)

    button.InputBegan:Connect(function(input)
        local t = input.UserInputType
        if t == Enum.UserInputType.MouseButton1 or t == Enum.UserInputType.Touch then
            tween(button, 0.08, {BackgroundColor3 = press})
        end
    end)

    button.InputEnded:Connect(function(input)
        local t = input.UserInputType
        if t == Enum.UserInputType.Touch then
            tween(button, 0.12, {BackgroundColor3 = normal})
        elseif t == Enum.UserInputType.MouseButton1 then
            tween(button, 0.12, {BackgroundColor3 = hovering and hover or normal})
        end
    end)
end

----------------------------------------------------------------------
-- Configurações persistentes
----------------------------------------------------------------------

local function canUseFiles()
    return type(writefile) == "function" and type(readfile) == "function" and type(isfile) == "function"
end

local function loadFlags()
    Flags = {}
    if not (persist and canUseFiles()) then return end

    local ok, data = pcall(function()
        if isfile(saveFile) then
            return HttpService:JSONDecode(readfile(saveFile))
        end
    end)

    if ok and type(data) == "table" then
        Flags = data
    end
end

local function queueSave()
    if not (persist and canUseFiles()) or saveQueued then return end
    saveQueued = true
    task.delay(0.5, function()
        saveQueued = false
        pcall(function()
            writefile(saveFile, HttpService:JSONEncode(Flags))
        end)
    end)
end

local function setFlag(flag, value)
    if flag == nil then return end
    Flags[flag] = value
    queueSave()
end

function RNUI:GetFlag(flag, fallback)
    local value = Flags[flag]
    if value == nil then return fallback end
    return value
end

function RNUI:SetFlag(flag, value)
    setFlag(flag, value)
end

----------------------------------------------------------------------
-- Janela: tamanho, posição e dropdowns
----------------------------------------------------------------------

local function closeAllDropdowns()
    for _, close in ipairs(Dropdowns) do
        close()
    end
end

local function resizeWindow(size)
    if not MainFrame then return end
    if sizeTween then sizeTween:Cancel() end
    sizeTween = tween(MainFrame, 0.25, {Size = size})
end

-- Mantém a janela inteira dentro da tela
local function clampWindow()
    if not (ScreenGui and MainFrame) then return end

    local screen = ScreenGui.AbsoluteSize
    if screen.X <= 0 or screen.Y <= 0 then return end

    local size = MainFrame.AbsoluteSize
    local pos = MainFrame.AbsolutePosition - ScreenGui.AbsolutePosition
    local x = math.clamp(pos.X, 0, math.max(screen.X - size.X, 0))
    local y = math.clamp(pos.Y, 0, math.max(screen.Y - size.Y, 0))

    if x ~= pos.X or y ~= pos.Y then
        MainFrame.Position = UDim2.fromOffset(x, y)
    end
end

-- Altura da janela acompanha o conteúdo, com limites
local function applyHeight()
    if not (ScreenGui and UIListLayout) then return end

    local maxH = MAX_HEIGHT
    local screenY = ScreenGui.AbsoluteSize.Y
    if screenY > 0 then
        maxH = math.max(MIN_HEIGHT, math.min(MAX_HEIGHT, screenY - 20))
    end

    expandedHeight = math.clamp(UIListLayout.AbsoluteContentSize.Y + CHROME, MIN_HEIGHT, maxH)

    if not isMinimized then
        resizeWindow(UDim2.fromOffset(windowWidth, expandedHeight))
    end
end

function RNUI:SetMinimized(state)
    if not ready() then return end
    isMinimized = state == true
    closeAllDropdowns()
    MinimizeButton.Text = isMinimized and "+" or "-"
    resizeWindow(UDim2.fromOffset(windowWidth, isMinimized and HEADER or expandedHeight))
end

----------------------------------------------------------------------
-- Init / Destroy
----------------------------------------------------------------------

function RNUI:Init(config)
    config = config or {}

    -- Reexecução do script: limpa a execução anterior e qualquer UI duplicada
    local env = (type(getgenv) == "function" and getgenv()) or _G
    if type(env.__RNUI_Destroy) == "function" then
        pcall(env.__RNUI_Destroy)
    end
    self:Destroy()

    local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")
    local old = PlayerGui:FindFirstChild(GUI_NAME)
    if old then old:Destroy() end
    env.__RNUI_Destroy = function()
        RNUI:Destroy()
    end

    persist = config.Persist ~= false
    saveFile = config.SaveFile or "RNUI_Config.json"
    loadFlags()

    ScreenGui = create("ScreenGui", {
        Name = GUI_NAME,
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        DisplayOrder = 100,
    }, PlayerGui)

    -- Largura limitada à tela (celulares estreitos)
    windowWidth = config.Width or 250
    local screenX = ScreenGui.AbsoluteSize.X
    if screenX > 60 then
        windowWidth = math.min(windowWidth, screenX - 20)
    end

    MainFrame = create("Frame", {
        Name = "MainFrame",
        Size = UDim2.fromOffset(windowWidth, MIN_HEIGHT),
        Position = UDim2.fromScale(0.35, 0.3),
        BackgroundColor3 = THEME.Window,
        BorderSizePixel = 0,
        ClipsDescendants = true, -- ao minimizar o conteúdo é cortado, sem precisar esconder nada
    }, ScreenGui)
    corner(MainFrame, 8)

    -- Fundo invisível para arrastar a janela por qualquer área livre
    local BackgroundDrag = create("Frame", {
        Name = "BackgroundDrag",
        Size = UDim2.fromScale(1, 1),
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        ZIndex = 0,
    }, MainFrame)

    -- Barra de título
    local TitleBar = create("Frame", {
        Name = "TitleBar",
        Size = UDim2.new(1, 0, 0, HEADER),
        BackgroundColor3 = THEME.Title,
        BorderSizePixel = 0,
    }, MainFrame)
    corner(TitleBar, 8)

    create("TextLabel", {
        Name = "Title",
        Size = UDim2.new(1, -HEADER * 2, 1, 0),
        Position = UDim2.fromOffset(HEADER, 0),
        BackgroundTransparency = 1,
        Text = tostring(config.Title or "RN TEAM"),
        TextColor3 = THEME.Text,
        Font = Enum.Font.SourceSansBold,
        TextSize = 16,
        TextTruncate = Enum.TextTruncate.AtEnd,
    }, TitleBar)

    MinimizeButton = create("TextButton", {
        Name = "Minimize",
        Size = UDim2.fromOffset(HEADER, HEADER),
        Position = UDim2.new(1, -HEADER, 0, 0),
        BackgroundTransparency = 1,
        Text = "-",
        TextColor3 = THEME.Text,
        Font = Enum.Font.SourceSansBold,
        TextSize = 22,
        AutoButtonColor = false,
    }, TitleBar)

    -- Área de conteúdo (rolagem sem barra visível)
    ScrollFrame = create("ScrollingFrame", {
        Name = "Content",
        Size = UDim2.new(1, -SIDE_PAD * 2, 1, -CHROME),
        Position = UDim2.fromOffset(SIDE_PAD, CONTENT_TOP),
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        ScrollBarThickness = 0,
        ScrollBarImageTransparency = 1,
        ScrollingDirection = Enum.ScrollingDirection.Y,
        AutomaticCanvasSize = Enum.AutomaticSize.Y,
        CanvasSize = UDim2.new(),
        ClipsDescendants = true,
    }, MainFrame)

    -- LayoutOrder garante que os elementos aparecem na ordem em que foram criados
    UIListLayout = create("UIListLayout", {
        Padding = UDim.new(0, 10),
        SortOrder = Enum.SortOrder.LayoutOrder,
    }, ScrollFrame)

    -- Créditos
    create("TextLabel", {
        Name = "Credits",
        Size = UDim2.new(1, 0, 0, FOOTER),
        Position = UDim2.new(0, 0, 1, -FOOTER),
        BackgroundTransparency = 1,
        Text = tostring(config.Credits or "YouTube: RN_TEAM"),
        TextColor3 = THEME.SubText,
        Font = Enum.Font.SourceSansBold,
        TextSize = 16,
    }, MainFrame)

    ------------------------------------------------------------------
    -- Arrastar (mouse e toque), sempre dentro da tela
    ------------------------------------------------------------------
    local dragging = false
    local dragInput, dragStart, startPos

    local function update(input)
        local delta = input.Position - dragStart
        local screen = ScreenGui.AbsoluteSize
        local size = MainFrame.AbsoluteSize
        local x = math.clamp(startPos.X + delta.X, 0, math.max(screen.X - size.X, 0))
        local y = math.clamp(startPos.Y + delta.Y, 0, math.max(screen.Y - size.Y, 0))
        MainFrame.Position = UDim2.fromOffset(x, y)
    end

    local function connectDragEvents(frame)
        frame.InputBegan:Connect(function(input)
            local t = input.UserInputType
            if t == Enum.UserInputType.MouseButton1 or t == Enum.UserInputType.Touch then
                dragging = true
                dragInput = input
                dragStart = input.Position
                startPos = MainFrame.AbsolutePosition - ScreenGui.AbsolutePosition

                local conn
                conn = input.Changed:Connect(function()
                    if input.UserInputState == Enum.UserInputState.End then
                        dragging = false
                        conn:Disconnect()
                    end
                end)
            end
        end)
    end

    connectDragEvents(TitleBar)
    connectDragEvents(BackgroundDrag)

    connect(UserInputService.InputChanged, function(input)
        if not dragging or not MainFrame then return end
        if input.UserInputType == Enum.UserInputType.MouseMovement or input == dragInput then
            update(input)
        end
    end)

    ------------------------------------------------------------------
    -- Minimizar e ajuste de altura
    ------------------------------------------------------------------
    MinimizeButton.MouseButton1Click:Connect(function()
        RNUI:SetMinimized(not isMinimized)
    end)

    UIListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(applyHeight)
    MainFrame:GetPropertyChangedSignal("AbsoluteSize"):Connect(clampWindow)
    ScreenGui:GetPropertyChangedSignal("AbsoluteSize"):Connect(function()
        applyHeight()
        clampWindow()
    end)

    task.defer(function()
        applyHeight()
        clampWindow()
    end)

    return self
end

function RNUI:Destroy()
    for _, c in ipairs(Connections) do
        c:Disconnect()
    end
    table.clear(Connections)
    table.clear(Dropdowns)

    if sizeTween then
        sizeTween:Cancel()
        sizeTween = nil
    end

    if ScreenGui then
        ScreenGui:Destroy()
    end

    ScreenGui, MainFrame, ScrollFrame, UIListLayout, MinimizeButton = nil, nil, nil, nil, nil
    isMinimized = false
    layoutOrder = 0
end

----------------------------------------------------------------------
-- Componentes
----------------------------------------------------------------------

-- Botão
function RNUI:Button(text, callback)
    if not ready() then return nil end

    local Button = create("TextButton", {
        Size = UDim2.new(1, 0, 0, 36),
        BackgroundColor3 = THEME.Element,
        Text = tostring(text),
        TextColor3 = THEME.Text,
        Font = Enum.Font.SourceSansBold,
        TextSize = 16,
        AutoButtonColor = false,
        LayoutOrder = nextOrder(),
    }, ScrollFrame)
    corner(Button, 6)
    bindFX(Button, THEME.Element, THEME.ElementHover, THEME.ElementPress)

    Button.MouseButton1Click:Connect(function()
        safeCall(callback, "Button " .. tostring(text))
    end)

    return Button
end

-- Toggle  (flag opcional: salva e restaura o estado automaticamente)
function RNUI:Toggle(text, default, callback, flag)
    if not ready() then return nil end

    local state = default == true
    local restored = false
    if flag ~= nil and type(Flags[flag]) == "boolean" then
        state = Flags[flag]
        restored = true
    end

    local ToggleContainer = create("Frame", {
        Size = UDim2.new(1, 0, 0, 34),
        BackgroundTransparency = 1,
        LayoutOrder = nextOrder(),
    }, ScrollFrame)

    local ToggleButton = create("TextButton", {
        Size = UDim2.fromScale(1, 1),
        BackgroundTransparency = 1,
        Text = "  " .. tostring(text),
        TextColor3 = THEME.Text,
        Font = Enum.Font.SourceSansBold,
        TextSize = 16,
        TextXAlignment = Enum.TextXAlignment.Left,
        AutoButtonColor = false,
    }, ToggleContainer)

    local ToggleBox = create("Frame", {
        Size = UDim2.fromOffset(22, 22),
        Position = UDim2.new(1, -27, 0.5, -11),
        BackgroundColor3 = THEME.Off,
    }, ToggleButton)
    corner(ToggleBox, 4)

    local function paint(animated)
        local color = state and THEME.Accent or THEME.Off
        if animated then
            tween(ToggleBox, 0.15, {BackgroundColor3 = color})
        else
            ToggleBox.BackgroundColor3 = color
        end
    end

    local control = {}

    function control.Set(value, silent)
        state = value == true
        paint(true)
        setFlag(flag, state)
        if not silent then
            safeCall(callback, "Toggle " .. tostring(text), state)
        end
    end

    function control.Get()
        return state
    end

    ToggleButton.MouseButton1Click:Connect(function()
        control.Set(not state)
    end)

    paint(false)

    -- Valor restaurado da config: avisa o callback para o recurso refletir o toggle
    if restored then
        task.defer(safeCall, callback, "Toggle " .. tostring(text), state)
    end

    return ToggleContainer, control
end

-- Dropdown  (flag opcional; opções repetidas aparecem uma única vez)
function RNUI:Dropdown(text, options, default, callback, flag)
    if not ready() then return nil end

    text = tostring(text)
    options = dedupe(options)

    local selected = default
    local restored = false
    if flag ~= nil and Flags[flag] ~= nil then
        selected = Flags[flag]
        restored = true
    end
    if selected == nil or table.find(options, selected) == nil then
        selected = options[1]
        restored = false
    end

    local DropdownButton = create("TextButton", {
        Size = UDim2.new(1, 0, 0, 36),
        BackgroundColor3 = THEME.Element,
        Text = "",
        AutoButtonColor = false,
        LayoutOrder = nextOrder(),
    }, ScrollFrame)
    corner(DropdownButton, 6)
    bindFX(DropdownButton, THEME.Element, THEME.ElementHover, THEME.ElementPress)

    local Caption = create("TextLabel", {
        Size = UDim2.new(1, -52, 1, 0),
        Position = UDim2.fromOffset(26, 0),
        BackgroundTransparency = 1,
        TextColor3 = THEME.Text,
        Font = Enum.Font.SourceSansBold,
        TextSize = 16,
        TextTruncate = Enum.TextTruncate.AtEnd,
    }, DropdownButton)

    local Arrow = create("TextLabel", {
        Size = UDim2.fromOffset(20, 20),
        Position = UDim2.new(1, -25, 0.5, -10),
        BackgroundTransparency = 1,
        Text = "▼",
        TextColor3 = THEME.SubText,
        Font = Enum.Font.SourceSansBold,
        TextSize = 14,
    }, DropdownButton)

    -- Fundo transparente: toque fora da lista fecha o dropdown
    local Blocker = create("TextButton", {
        Size = UDim2.fromScale(1, 1),
        BackgroundTransparency = 1,
        Text = "",
        AutoButtonColor = false,
        Visible = false,
        ZIndex = 99,
    }, ScreenGui)

    -- Lista (fica na ScreenGui para não ser cortada pela rolagem da janela)
    local List = create("ScrollingFrame", {
        Size = UDim2.fromOffset(0, 0),
        BackgroundColor3 = THEME.List,
        BorderSizePixel = 0,
        ClipsDescendants = true,
        Visible = false,
        ZIndex = 100,
        ScrollBarThickness = 0,
        ScrollBarImageTransparency = 1,
        AutomaticCanvasSize = Enum.AutomaticSize.Y,
        CanvasSize = UDim2.new(),
    }, ScreenGui)
    corner(List, 6)
    create("UIListLayout", {
        Padding = UDim.new(0, 2),
        SortOrder = Enum.SortOrder.LayoutOrder,
    }, List)

    local isOpen = false
    local openToken = 0
    local finalHeight = 0
    local setOpen

    local function refreshText()
        Caption.Text = text .. ": " .. (selected ~= nil and tostring(selected) or "-")
    end

    local function choose(value, silent)
        selected = value
        refreshText()
        setFlag(flag, value)
        setOpen(false)
        if not silent then
            safeCall(callback, "Dropdown " .. text, value)
        end
    end

    local function buildOptions()
        for _, child in ipairs(List:GetChildren()) do
            if child:IsA("TextButton") then
                child:Destroy()
            end
        end

        for i, option in ipairs(options) do
            local OptionButton = create("TextButton", {
                Size = UDim2.new(1, 0, 0, OPTION_H - 2),
                BackgroundColor3 = THEME.Option,
                Text = tostring(option),
                TextColor3 = THEME.Text,
                Font = Enum.Font.SourceSans,
                TextSize = 15,
                AutoButtonColor = false,
                ZIndex = 101,
                LayoutOrder = i,
            }, List)
            corner(OptionButton, 4)
            bindFX(OptionButton, THEME.Option, THEME.OptionHover, THEME.OptionPress)

            OptionButton.MouseButton1Click:Connect(function()
                choose(option)
            end)
        end

        finalHeight = math.min(#options * OPTION_H, LIST_MAX_H)
    end

    local function reposition()
        local origin = ScreenGui.AbsolutePosition
        local screen = ScreenGui.AbsoluteSize
        local pos = DropdownButton.AbsolutePosition - origin
        local size = DropdownButton.AbsoluteSize

        local y = pos.Y + size.Y + 4
        -- Sem espaço embaixo: abre para cima
        if y + finalHeight > screen.Y and pos.Y - finalHeight - 4 >= 0 then
            y = pos.Y - finalHeight - 4
        end
        List.Position = UDim2.fromOffset(pos.X, y)
    end

    function setOpen(open)
        if open == isOpen then return end
        if open and #options == 0 then return end

        if open then
            closeAllDropdowns() -- só um dropdown aberto por vez
        end

        isOpen = open
        openToken += 1
        local token = openToken
        local width = DropdownButton.AbsoluteSize.X

        if open then
            reposition()
            List.Size = UDim2.fromOffset(width, 0)
            List.Visible = true
            Blocker.Visible = true
            Arrow.Text = "▲"
            tween(List, 0.15, {Size = UDim2.fromOffset(width, finalHeight)})
        else
            Blocker.Visible = false
            Arrow.Text = "▼"
            local closeTween = tween(List, 0.15, {Size = UDim2.fromOffset(width, 0)})
            closeTween.Completed:Connect(function()
                -- Se reabriu durante a animação, não esconde a lista
                if token == openToken then
                    List.Visible = false
                end
            end)
        end
    end

    table.insert(Dropdowns, function()
        setOpen(false)
    end)

    DropdownButton.MouseButton1Click:Connect(function()
        setOpen(not isOpen)
    end)
    Blocker.MouseButton1Click:Connect(function()
        setOpen(false)
    end)

    refreshText()
    buildOptions()

    local control = {}

    function control.Get()
        return selected
    end

    function control.Set(value, silent)
        if table.find(options, value) == nil then return false end
        choose(value, silent)
        return true
    end

    -- Atualiza as opções dinamicamente (repetidas são removidas)
    function control.SetOptions(newOptions)
        options = dedupe(newOptions)
        if selected == nil or table.find(options, selected) == nil then
            selected = options[1]
            refreshText()
        end
        setOpen(false)
        buildOptions()
    end

    if restored then
        task.defer(safeCall, callback, "Dropdown " .. text, selected)
    end

    return DropdownButton, control
end

-- Caixa de texto  (o callback recebe o texto e se foi Enter; dispara também ao fechar o teclado no celular)
function RNUI:TextBox(labelText, placeholder, callback, flag, default)
    if not ready() then return nil end

    local initial = default ~= nil and tostring(default) or ""
    local restored = false
    if flag ~= nil and type(Flags[flag]) == "string" then
        initial = Flags[flag]
        restored = true
    end

    local TextContainer = create("Frame", {
        Size = UDim2.new(1, 0, 0, 32),
        BackgroundTransparency = 1,
        LayoutOrder = nextOrder(),
    }, ScrollFrame)

    create("TextLabel", {
        Size = UDim2.fromScale(0.55, 1),
        BackgroundTransparency = 1,
        Text = tostring(labelText),
        TextColor3 = THEME.Text,
        Font = Enum.Font.SourceSansBold,
        TextSize = 16,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextTruncate = Enum.TextTruncate.AtEnd,
    }, TextContainer)

    local TextBox = create("TextBox", {
        Size = UDim2.fromScale(0.42, 1),
        Position = UDim2.fromScale(0.58, 0),
        BackgroundColor3 = THEME.Element,
        Text = initial,
        PlaceholderText = tostring(placeholder or "Digite..."),
        PlaceholderColor3 = THEME.Placeholder,
        TextColor3 = THEME.Text,
        Font = Enum.Font.SourceSansBold,
        TextSize = 16,
        ClearTextOnFocus = false,
    }, TextContainer)
    corner(TextBox, 6)
    bindFX(TextBox, THEME.Element, THEME.ElementHover, THEME.ElementHover)

    TextBox.FocusLost:Connect(function(enterPressed)
        setFlag(flag, TextBox.Text)
        safeCall(callback, "TextBox " .. tostring(labelText), TextBox.Text, enterPressed)
    end)

    local control = {}

    function control.Get()
        return TextBox.Text
    end

    function control.Set(value, silent)
        TextBox.Text = tostring(value)
        setFlag(flag, TextBox.Text)
        if not silent then
            safeCall(callback, "TextBox " .. tostring(labelText), TextBox.Text, false)
        end
    end

    if restored then
        task.defer(safeCall, callback, "TextBox " .. tostring(labelText), initial, false)
    end

    return TextContainer, TextBox, control
end

-- Seletor de evento + botão de ativar
function RNUI:EventSystem(eventConfig, eventList, activateText)
    if not ready() then return nil end

    eventConfig = eventConfig or {}

    -- Sem lista explícita: usa os nomes definidos em eventConfig
    if not eventList then
        eventList = {}
        for name in pairs(eventConfig) do
            table.insert(eventList, name)
        end
        table.sort(eventList)
    end

    if #eventList == 0 then
        warn("[RNUI] EventSystem: lista de eventos vazia.")
        return nil
    end

    local selectedEvent = eventList[1]

    local EventDropdown, dropdownControl = self:Dropdown("Selecionar Evento", eventList, eventList[1], function(event)
        selectedEvent = event
        print("🎯 Evento selecionado:", event)
    end, "EventSystem_Selecionado")

    local ActivateButton = self:Button(activateText or "🚀 ATIVAR EVENTO", function()
        local handler = selectedEvent and eventConfig[selectedEvent]
        if type(handler) == "function" then
            print("🎯 Executando evento:", selectedEvent)
            local ok, err = pcall(handler)
            if not ok then
                warn(("[RNUI] erro no evento '%s': %s"):format(tostring(selectedEvent), tostring(err)))
            end
        else
            warn("❌ Evento não encontrado ou não selecionado")
        end
    end)

    return EventDropdown, ActivateButton, dropdownControl
end

-- Label (retorna também um controle com :Set(texto))
function RNUI:Label(text)
    if not ready() then return nil end

    local Label = create("TextLabel", {
        Size = UDim2.new(1, 0, 0, 25),
        BackgroundTransparency = 1,
        Text = tostring(text),
        TextColor3 = THEME.Text,
        Font = Enum.Font.SourceSansBold,
        TextSize = 16,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextTruncate = Enum.TextTruncate.AtEnd,
        LayoutOrder = nextOrder(),
    }, ScrollFrame)

    local control = {}
    function control.Set(newText)
        Label.Text = tostring(newText)
    end

    return Label, control
end

-- Separador
function RNUI:Separator()
    if not ready() then return nil end

    return create("Frame", {
        Size = UDim2.new(1, 0, 0, 1),
        BackgroundColor3 = THEME.Line,
        BorderSizePixel = 0,
        LayoutOrder = nextOrder(),
    }, ScrollFrame)
end

return RNUI
