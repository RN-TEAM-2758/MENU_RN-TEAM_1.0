-- RNUI Library - RN TEAM
local RNUI = {}

-- Serviços
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")

-- Variáveis globais
local LocalPlayer = Players.LocalPlayer
local ScreenGui
local MainFrame
local ContentContainer
local UIListLayout
local Elements = {}

-- Configurações padrão
local DEFAULT_CONFIG = {
    Size = UDim2.new(0, 250, 0, 220),
    Position = UDim2.new(0.35, 0, 0.3, 0),
    BackgroundColor = Color3.fromRGB(20, 20, 20),
    Title = "RN TEAM",
    Credits = "YouTube: RN_TEAM"
}

-- Variáveis de controle
local originalSize
local minimizedSize = UDim2.new(0, 250, 0, 30)
local isMinimized = false
local Creditos

-- Sistema de Drag
local dragging, dragInput, dragStart, startPos
local function update(input)
    local delta = input.Position - dragStart
    MainFrame.Position = UDim2.new(
        startPos.X.Scale,
        startPos.X.Offset + delta.X,
        startPos.Y.Scale,
        startPos.Y.Offset + delta.Y
    )
end

local function connectDragEvents(frame)
    frame.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = MainFrame.Position
            
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    dragging = false
                end
            end)
        end
    end)
    
    frame.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
            dragInput = input
        end
    end)
end

-- Ajuste de altura (auto-ajuste)
local function ajustarAlturaJanela()
    if not MainFrame or isMinimized then return end

    local alturaMinima = 220
    local alturaMaxima = 400
    local alturaConteudo = UIListLayout.AbsoluteContentSize.Y + 80
    local novaAltura = math.clamp(alturaConteudo, alturaMinima, alturaMaxima)
    
    originalSize = UDim2.new(0, 250, 0, novaAltura)
    
    TweenService:Create(
        MainFrame,
        TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
        {Size = originalSize}
    ):Play()
    
    ContentContainer.CanvasSize = UDim2.new(0, 0, 0, UIListLayout.AbsoluteContentSize.Y)
end

-- Inicialização
function RNUI:Init(config)
    config = config or {}
    
    ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
    ScreenGui.ResetOnSpawn = false
    
    MainFrame = Instance.new("Frame")
    MainFrame.Size = config.Size or DEFAULT_CONFIG.Size
    MainFrame.Position = config.Position or DEFAULT_CONFIG.Position
    MainFrame.BackgroundColor3 = config.BackgroundColor or DEFAULT_CONFIG.BackgroundColor
    MainFrame.BorderSizePixel = 0
    MainFrame.Parent = ScreenGui
    Instance.new("UICorner", MainFrame).CornerRadius = UDim.new(0, 8)
    
    -- Title Bar
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1, 0, 0, 30)
    TitleBar.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    TitleBar.BorderSizePixel = 0
    TitleBar.Parent = MainFrame
    Instance.new("UICorner", TitleBar).CornerRadius = UDim.new(0, 8)
    
    -- Título
    local Titulo = Instance.new("TextLabel")
    Titulo.Size = UDim2.new(0.8, 0, 1, 0)
    Titulo.Position = UDim2.new(0.1, 0, 0, 0)
    Titulo.BackgroundTransparency = 1
    Titulo.Text = config.Title or DEFAULT_CONFIG.Title
    Titulo.TextColor3 = Color3.fromRGB(255, 255, 255)
    Titulo.Font = Enum.Font.SourceSansBold
    Titulo.TextSize = 16
    Titulo.TextXAlignment = Enum.TextXAlignment.Center
    Titulo.Parent = TitleBar
    
    -- Botão Minimizar
    local MinimizeButton = Instance.new("TextButton")
    MinimizeButton.Size = UDim2.new(0, 30, 0, 30)
    MinimizeButton.Position = UDim2.new(1, -30, 0, 0)
    MinimizeButton.BackgroundTransparency = 1
    MinimizeButton.Text = "-"
    MinimizeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    MinimizeButton.Font = Enum.Font.SourceSansBold
    MinimizeButton.TextSize = 20
    MinimizeButton.Parent = TitleBar
    
    -- Container
    ContentContainer = Instance.new("ScrollingFrame")
    ContentContainer.Size = UDim2.new(1, -10, 1, -60)
    ContentContainer.Position = UDim2.new(0, 5, 0, 35)
    ContentContainer.BackgroundTransparency = 1
    ContentContainer.BorderSizePixel = 0
    ContentContainer.ScrollBarThickness = 5
    ContentContainer.ScrollBarImageColor3 = Color3.fromRGB(100, 100, 100)
    ContentContainer.ClipsDescendants = true
    ContentContainer.Parent = MainFrame
    
    UIListLayout = Instance.new("UIListLayout")
    UIListLayout.Padding = UDim.new(0, 10)
    UIListLayout.Parent = ContentContainer
    
    -- Créditos
    Creditos = Instance.new("TextLabel")
    Creditos.Size = UDim2.new(1, 0, 0, 30)
    Creditos.Position = UDim2.new(0, 0, 1, -30)
    Creditos.BackgroundTransparency = 1
    Creditos.Text = config.Credits or DEFAULT_CONFIG.Credits
    Creditos.TextColor3 = Color3.fromRGB(200, 200, 200)
    Creditos.Font = Enum.Font.SourceSansBold
    Creditos.TextSize = 16
    Creditos.Parent = MainFrame
    
    -- Background drag invisível
    local BackgroundDrag = Instance.new("Frame")
    BackgroundDrag.Size = UDim2.new(1, 0, 1, 0)
    BackgroundDrag.BackgroundTransparency = 1
    BackgroundDrag.BorderSizePixel = 0
    BackgroundDrag.ZIndex = 0
    BackgroundDrag.Parent = MainFrame
    
    -- Conectar drag
    connectDragEvents(TitleBar)
    connectDragEvents(BackgroundDrag)
    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging then update(input) end
    end)
    
    -- Minimizar/restaurar
    originalSize = MainFrame.Size:Clone()
    MinimizeButton.MouseButton1Click:Connect(function()
        isMinimized = not isMinimized

        if isMinimized then
            ContentContainer.Visible = false
            Creditos.Visible = false
            BackgroundDrag.Visible = false
            MinimizeButton.Text = "+"
            TweenService:Create(
                MainFrame,
                TweenInfo.new(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = minimizedSize}
            ):Play()
        else
            ContentContainer.Visible = true
            Creditos.Visible = true
            BackgroundDrag.Visible = true
            MinimizeButton.Text = "-"
            ajustarAlturaJanela()
        end
    end)
    
    -- Auto-ajuste
    UIListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(ajustarAlturaJanela)
    ajustarAlturaJanela()
    
    return self
end

-- Funções de criação de elementos
function RNUI:Button(text, callback)
    if not ContentContainer then return end
    local Button = Instance.new("TextButton")
    Button.Size = UDim2.new(1, 0, 0, 35)
    Button.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    Button.Text = text
    Button.TextColor3 = Color3.fromRGB(255, 255, 255)
    Button.Font = Enum.Font.SourceSansBold
    Button.TextSize = 16
    Button.ZIndex = 2
    Button.Parent = ContentContainer
    Instance.new("UICorner", Button).CornerRadius = UDim.new(0, 6)
    Button.MouseEnter:Connect(function() Button.BackgroundColor3 = Color3.fromRGB(70, 70, 70) end)
    Button.MouseLeave:Connect(function() Button.BackgroundColor3 = Color3.fromRGB(50, 50, 50) end)
    if callback then Button.MouseButton1Click:Connect(callback) end
    table.insert(Elements, Button)
    ajustarAlturaJanela()
    return Button
end

function RNUI:Toggle(text, default, callback)
    if not ContentContainer then return end
    local Container = Instance.new("Frame")
    Container.Size = UDim2.new(1,0,0,30)
    Container.BackgroundTransparency = 1
    Container.Parent = ContentContainer
    
    local ToggleButton = Instance.new("TextButton")
    ToggleButton.Size = UDim2.new(1,0,1,0)
    ToggleButton.BackgroundTransparency = 1
    ToggleButton.Text = text
    ToggleButton.TextColor3 = Color3.fromRGB(255,255,255)
    ToggleButton.Font = Enum.Font.SourceSansBold
    ToggleButton.TextSize = 16
    ToggleButton.TextXAlignment = Enum.TextXAlignment.Left
    ToggleButton.Parent = Container
    
    local ToggleBox = Instance.new("Frame")
    ToggleBox.Size = UDim2.new(0,20,0,20)
    ToggleBox.Position = UDim2.new(1,-25,0.5,-10)
    ToggleBox.BackgroundColor3 = Color3.fromRGB(40,40,40)
    ToggleBox.Parent = ToggleButton
    Instance.new("UICorner", ToggleBox).CornerRadius = UDim.new(0,4)
    
    local ToggleState = default or false
    local function updateToggle()
        ToggleBox.BackgroundColor3 = ToggleState and Color3.fromRGB(0,170,255) or Color3.fromRGB(40,40,40)
    end
    ToggleButton.MouseButton1Click:Connect(function()
        ToggleState = not ToggleState
        updateToggle()
        if callback then callback(ToggleState) end
    end)
    updateToggle()
    table.insert(Elements, Container)
    ajustarAlturaJanela()
    return Container
end

function RNUI:Dropdown(text, options, default, callback)
    if not ContentContainer then return end
    local selected = default or options[1]
    local Button = Instance.new("TextButton")
    Button.Size = UDim2.new(1,0,0,35)
    Button.BackgroundColor3 = Color3.fromRGB(50,50,50)
    Button.Text = text..": "..selected
    Button.TextColor3 = Color3.fromRGB(255,255,255)
    Button.Font = Enum.Font.SourceSansBold
    Button.TextSize = 16
    Button.Parent = ContentContainer
    Instance.new("UICorner", Button).CornerRadius = UDim.new(0,6)
    
    local DropdownFrame = Instance.new("ScrollingFrame")
    DropdownFrame.Size = UDim2.new(0,240,0,0)
    DropdownFrame.BackgroundColor3 = Color3.fromRGB(40,40,40)
    DropdownFrame.BorderSizePixel = 0
    DropdownFrame.Visible = false
    DropdownFrame.ClipsDescendants = true
    DropdownFrame.Parent = ScreenGui
    Instance.new("UICorner", DropdownFrame).CornerRadius = UDim.new(0,6)
    
    local Layout = Instance.new("UIListLayout")
    Layout.Padding = UDim.new(0,2)
    Layout.Parent = DropdownFrame
    
    local isOpen = false
    local function reposition()
        local pos = Button.AbsolutePosition
        local size = Button.AbsoluteSize
        DropdownFrame.Position = UDim2.new(0,pos.X,0,pos.Y + size.Y + 5)
    end
    
    for _, option in ipairs(options) do
        local Opt = Instance.new("TextButton")
        Opt.Size = UDim2.new(1,0,0,30)
        Opt.BackgroundColor3 = Color3.fromRGB(60,60,60)
        Opt.Text = option
        Opt.TextColor3 = Color3.fromRGB(255,255,255)
        Opt.Font = Enum.Font.SourceSans
        Opt.TextSize = 14
        Opt.Parent = DropdownFrame
        Instance.new("UICorner", Opt).CornerRadius = UDim.new(0,4)
        Opt.MouseEnter:Connect(function() Opt.BackgroundColor3 = Color3.fromRGB(80,80,80) end)
        Opt.MouseLeave:Connect(function() Opt.BackgroundColor3 = Color3.fromRGB(60,60,60) end)
        Opt.MouseButton1Click:Connect(function()
            selected = option
            Button.Text = text..": "..option
            DropdownFrame.Visible = false
            isOpen = false
            if callback then callback(option) end
        end)
    end
    
    Button.MouseButton1Click:Connect(function()
        isOpen = not isOpen
        if isOpen then
            reposition()
            DropdownFrame.Visible = true
            DropdownFrame.Size = UDim2.new(0,240,0,math.min(#options*32,150))
        else
            DropdownFrame.Visible = false
        end
    end)
    
    table.insert(Elements, Button)
    ajustarAlturaJanela()
    return Button
end

function RNUI:Label(text)
    if not ContentContainer then return end
    local Label = Instance.new("TextLabel")
    Label.Size = UDim2.new(1,0,0,25)
    Label.BackgroundTransparency = 1
    Label.Text = text
    Label.TextColor3 = Color3.fromRGB(255,255,255)
    Label.Font = Enum.Font.SourceSansBold
    Label.TextSize = 16
    Label.TextXAlignment = Enum.TextXAlignment.Left
    Label.Parent = ContentContainer
    table.insert(Elements, Label)
    ajustarAlturaJanela()
    return Label
end

function RNUI:Separator()
    if not ContentContainer then return end
    local Sep = Instance.new("Frame")
    Sep.Size = UDim2.new(1,0,0,1)
    Sep.BackgroundColor3 = Color3.fromRGB(60,60,60)
    Sep.BorderSizePixel = 0
    Sep.Parent = ContentContainer
    table.insert(Elements, Sep)
    ajustarAlturaJanela()
    return Sep
end

-- Destroy e visibilidade
function RNUI:Destroy()
    if ScreenGui then ScreenGui:Destroy(); ScreenGui=nil end
end
function RNUI:SetVisible(v)
    if ScreenGui then ScreenGui.Enabled = v end
end
function RNUI:SetTitle(t)
    if MainFrame then
        local title = MainFrame:FindFirstChildOfClass("Frame"):FindFirstChildOfClass("TextLabel")
        if title then title.Text = t end
    end
end

return RNUI
