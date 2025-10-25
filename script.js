-- RNUI completo e funcional
local RNUI = {}

-- Serviços
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

local LocalPlayer = Players.LocalPlayer
local ScreenGui
local MainFrame
local ContentContainer
local UIListLayout
local Elements = {}

-- Configurações padrão
local DEFAULT_CONFIG = {
    Size = UDim2.new(0, 300, 0, 220),
    Position = UDim2.new(0.35, 0, 0.3, 0),
    BackgroundColor = Color3.fromRGB(20, 20, 20),
    Title = "RN TEAM MENU",
    Credits = "YouTube: RN_TEAM"
}

local minimizedSize = UDim2.new(0, 300, 0, 30)
local isMinimized = false
local originalSize

-- Drag
local dragging, dragInput, dragStart, startPos
local function update(input)
    local delta = input.Position - dragStart
    MainFrame.Position = UDim2.new(
        startPos.X.Scale, startPos.X.Offset + delta.X,
        startPos.Y.Scale, startPos.Y.Offset + delta.Y
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

-- Ajuste de altura
local function ajustarAlturaJanela()
    if not MainFrame or isMinimized then return end
    local alturaMinima = 220
    local alturaMaxima = 400
    local alturaConteudo = UIListLayout.AbsoluteContentSize.Y + 80
    local novaAltura = math.clamp(alturaConteudo, alturaMinima, alturaMaxima)
    TweenService:Create(
        MainFrame,
        TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
        {Size = UDim2.new(0, 300, 0, novaAltura)}
    ):Play()
    ContentContainer.CanvasSize = UDim2.new(0,0,0,UIListLayout.AbsoluteContentSize.Y)
end

-- Inicializar menu
function RNUI:Init(config)
    config = config or {}

    -- Criar ScreenGui
    ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
    ScreenGui.ResetOnSpawn = false

    -- Frame principal
    MainFrame = Instance.new("Frame")
    MainFrame.Size = config.Size or DEFAULT_CONFIG.Size
    MainFrame.Position = config.Position or DEFAULT_CONFIG.Position
    MainFrame.BackgroundColor3 = config.BackgroundColor or DEFAULT_CONFIG.BackgroundColor
    MainFrame.BorderSizePixel = 0
    MainFrame.Parent = ScreenGui
    Instance.new("UICorner", MainFrame).CornerRadius = UDim.new(0,8)

    -- TitleBar
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1,0,0,30)
    TitleBar.BackgroundColor3 = Color3.fromRGB(30,30,30)
    TitleBar.BorderSizePixel = 0
    TitleBar.Parent = MainFrame
    Instance.new("UICorner", TitleBar).CornerRadius = UDim.new(0,8)

    local Titulo = Instance.new("TextLabel")
    Titulo.Size = UDim2.new(0.8,0,1,0)
    Titulo.Position = UDim2.new(0.1,0,0,0)
    Titulo.BackgroundTransparency = 1
    Titulo.Text = config.Title or DEFAULT_CONFIG.Title
    Titulo.TextColor3 = Color3.fromRGB(255,255,255)
    Titulo.Font = Enum.Font.SourceSansBold
    Titulo.TextSize = 16
    Titulo.TextXAlignment = Enum.TextXAlignment.Center
    Titulo.Parent = TitleBar

    -- Botão minimizar
    local MinimizeButton = Instance.new("TextButton")
    MinimizeButton.Size = UDim2.new(0,30,0,30)
    MinimizeButton.Position = UDim2.new(1,-30,0,0)
    MinimizeButton.BackgroundTransparency = 1
    MinimizeButton.Text = "-"
    MinimizeButton.TextColor3 = Color3.fromRGB(255,255,255)
    MinimizeButton.Font = Enum.Font.SourceSansBold
    MinimizeButton.TextSize = 20
    MinimizeButton.Parent = TitleBar

    -- Conteúdo
    ContentContainer = Instance.new("ScrollingFrame")
    ContentContainer.Size = UDim2.new(1,-10,1,-60)
    ContentContainer.Position = UDim2.new(0,5,0,35)
    ContentContainer.BackgroundTransparency = 1
    ContentContainer.BorderSizePixel = 0
    ContentContainer.ScrollBarThickness = 5
    ContentContainer.ScrollBarImageColor3 = Color3.fromRGB(100,100,100)
    ContentContainer.ClipsDescendants = true
    ContentContainer.Parent = MainFrame

    UIListLayout = Instance.new("UIListLayout")
    UIListLayout.Padding = UDim.new(0,10)
    UIListLayout.Parent = ContentContainer

    -- Créditos
    local Creditos = Instance.new("TextLabel")
    Creditos.Size = UDim2.new(1,0,0,30)
    Creditos.Position = UDim2.new(0,0,1,-30)
    Creditos.BackgroundTransparency = 1
    Creditos.Text = config.Credits or DEFAULT_CONFIG.Credits
    Creditos.TextColor3 = Color3.fromRGB(200,200,200)
    Creditos.Font = Enum.Font.SourceSansBold
    Creditos.TextSize = 16
    Creditos.Parent = MainFrame

    -- Drag
    connectDragEvents(TitleBar)
    originalSize = MainFrame.Size:Clone()
    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging then
            update(input)
        end
    end)

    -- Minimizar
    MinimizeButton.MouseButton1Click:Connect(function()
        isMinimized = not isMinimized
        if isMinimized then
            TweenService:Create(MainFrame,TweenInfo.new(0.3),{Size = minimizedSize}):Play()
            ContentContainer.Visible = false
            Creditos.Visible = false
            MinimizeButton.Text = "+"
        else
            TweenService:Create(MainFrame,TweenInfo.new(0.3),{Size = originalSize}):Play()
            ContentContainer.Visible = true
            Creditos.Visible = true
            MinimizeButton.Text = "-"
            task.wait(0.3)
            ajustarAlturaJanela()
        end
    end)

    UIListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(ajustarAlturaJanela)
    task.wait(0.1)
    ajustarAlturaJanela()
    return self
end

-- Função Button
function RNUI:Button(text, callback)
    local Button = Instance.new("TextButton")
    Button.Size = UDim2.new(1,0,0,35)
    Button.BackgroundColor3 = Color3.fromRGB(50,50,50)
    Button.Text = text
    Button.TextColor3 = Color3.fromRGB(255,255,255)
    Button.Font = Enum.Font.SourceSansBold
    Button.TextSize = 16
    Button.ZIndex = 2
    Button.Parent = ContentContainer
    Instance.new("UICorner", Button).CornerRadius = UDim.new(0,6)

    Button.MouseEnter:Connect(function() Button.BackgroundColor3 = Color3.fromRGB(70,70,70) end)
    Button.MouseLeave:Connect(function() Button.BackgroundColor3 = Color3.fromRGB(50,50,50) end)
    if callback then Button.MouseButton1Click:Connect(callback) end
    table.insert(Elements, Button)
    ajustarAlturaJanela()
    return Button
end

-- Função Label
function RNUI:Label(text)
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

-- Função Separator
function RNUI:Separator()
    local Separator = Instance.new("Frame")
    Separator.Size = UDim2.new(1,0,0,1)
    Separator.BackgroundColor3 = Color3.fromRGB(60,60,60)
    Separator.BorderSizePixel = 0
    Separator.Parent = ContentContainer
    table.insert(Elements, Separator)
    ajustarAlturaJanela()
    return Separator
end

-- Função Destroy
function RNUI:Destroy()
    if ScreenGui then ScreenGui:Destroy() ScreenGui = nil end
end

return RNUI
