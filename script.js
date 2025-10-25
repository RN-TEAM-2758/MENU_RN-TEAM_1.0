-- UI Library - RN TEAM
local RNUI = {}

-- Serviços
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

-- Variáveis globais
local LocalPlayer = Players.LocalPlayer
local ScreenGui
local MainFrame
local ContentContainer
local UIListLayout
local Elements = {}

-- Função de inicialização
function RNUI:Init(config)
    config = config or {}
    
    -- Criar ScreenGui principal
    ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
    ScreenGui.ResetOnSpawn = false
    
    -- Criar frame principal
    MainFrame = Instance.new("Frame")
    MainFrame.Size = UDim2.new(0, 250, 0, 220)
    MainFrame.Position = UDim2.new(0.35, 0, 0.3, 0)
    MainFrame.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
    MainFrame.BorderSizePixel = 0
    MainFrame.Parent = ScreenGui
    
    local MainCorner = Instance.new("UICorner")
    MainCorner.CornerRadius = UDim.new(0, 8)
    MainCorner.Parent = MainFrame
    
    -- Title Bar
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1, 0, 0, 30)
    TitleBar.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    TitleBar.BorderSizePixel = 0
    TitleBar.Parent = MainFrame
    
    local TitleCorner = Instance.new("UICorner")
    TitleCorner.CornerRadius = UDim.new(0, 8)
    TitleCorner.Parent = TitleBar
    
    -- Título
    local Titulo = Instance.new("TextLabel")
    Titulo.Size = UDim2.new(0.8, 0, 1, 0)
    Titulo.Position = UDim2.new(0.1, 0, 0, 0)
    Titulo.BackgroundTransparency = 1
    Titulo.Text = config.Title or "RN TEAM"
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
    
    -- Container de conteúdo (FIXED - agora vai mostrar os elementos)
    ContentContainer = Instance.new("Frame")
    ContentContainer.Size = UDim2.new(1, -10, 1, -60)
    ContentContainer.Position = UDim2.new(0, 5, 0, 35)
    ContentContainer.BackgroundTransparency = 1
    ContentContainer.BorderSizePixel = 0
    ContentContainer.ClipsDescendants = true
    ContentContainer.Parent = MainFrame
    
    -- ScrollingFrame dentro do ContentContainer
    local ScrollFrame = Instance.new("ScrollingFrame")
    ScrollFrame.Size = UDim2.new(1, 0, 1, 0)
    ScrollFrame.Position = UDim2.new(0, 0, 0, 0)
    ScrollFrame.BackgroundTransparency = 1
    ScrollFrame.BorderSizePixel = 0
    ScrollFrame.ScrollBarThickness = 5
    ScrollFrame.ScrollBarImageColor3 = Color3.fromRGB(100, 100, 100)
    ScrollFrame.ClipsDescendants = true
    ScrollFrame.Parent = ContentContainer
    
    UIListLayout = Instance.new("UIListLayout")
    UIListLayout.Padding = UDim.new(0, 10)
    UIListLayout.Parent = ScrollFrame
    
    -- Créditos
    local Creditos = Instance.new("TextLabel")
    Creditos.Size = UDim2.new(1, 0, 0, 30)
    Creditos.Position = UDim2.new(0, 0, 1, -30)
    Creditos.BackgroundTransparency = 1
    Creditos.Text = config.Credits or "YouTube: RN_TEAM"
    Creditos.TextColor3 = Color3.fromRGB(200, 200, 200)
    Creditos.Font = Enum.Font.SourceSansBold
    Creditos.TextSize = 16
    Creditos.Parent = MainFrame
    
    -- Background para drag
    local BackgroundDrag = Instance.new("Frame")
    BackgroundDrag.Size = UDim2.new(1, 0, 1, 0)
    BackgroundDrag.BackgroundTransparency = 1
    BackgroundDrag.BorderSizePixel = 0
    BackgroundDrag.ZIndex = 0
    BackgroundDrag.Parent = MainFrame
    
    -- Sistema de Drag (simplificado)
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
    
    TitleBar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
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
    
    TitleBar.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement then
            dragInput = input
        end
    end)
    
    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging then
            update(input)
        end
    end)
    
    -- Sistema de minimizar
    local originalSize = MainFrame.Size
    local minimizedSize = UDim2.new(0, 250, 0, 30)
    local isMinimized = false
    
    MinimizeButton.MouseButton1Click:Connect(function()
        isMinimized = not isMinimized
        
        if isMinimized then
            -- Minimizar
            MainFrame.Size = minimizedSize
            ContentContainer.Visible = false
            Creditos.Visible = false
            BackgroundDrag.Visible = false
            MinimizeButton.Text = "+"
        else
            -- Restaurar
            MainFrame.Size = originalSize
            ContentContainer.Visible = true
            Creditos.Visible = true
            BackgroundDrag.Visible = true
            MinimizeButton.Text = "-"
        end
    end)
    
    -- Auto-ajuste de altura
    local function ajustarAlturaJanela()
        local alturaConteudo = UIListLayout.AbsoluteContentSize.Y + 80
        local novaAltura = math.clamp(alturaConteudo, 220, 400)
        
        MainFrame.Size = UDim2.new(0, 250, 0, novaAltura)
        ScrollFrame.CanvasSize = UDim2.new(0, 0, 0, UIListLayout.AbsoluteContentSize.Y)
    end
    
    UIListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(ajustarAlturaJanela)
    
    -- Salvar referência do ScrollFrame para usar nas funções
    self.ScrollFrame = ScrollFrame
    
    return self
end

-- Função para criar botão
function RNUI:Button(text, callback)
    if not self.ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local Button = Instance.new("TextButton")
    Button.Size = UDim2.new(1, 0, 0, 35)
    Button.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    Button.Text = text
    Button.TextColor3 = Color3.fromRGB(255, 255, 255)
    Button.Font = Enum.Font.SourceSansBold
    Button.TextSize = 16
    Button.Parent = self.ScrollFrame
    
    local ButtonCorner = Instance.new("UICorner")
    ButtonCorner.CornerRadius = UDim.new(0, 6)
    ButtonCorner.Parent = Button
    
    -- Efeitos hover
    Button.MouseEnter:Connect(function()
        Button.BackgroundColor3 = Color3.fromRGB(70, 70, 70)
    end)
    
    Button.MouseLeave:Connect(function()
        Button.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    end)
    
    -- Callback do clique
    if type(callback) == "function" then
        Button.MouseButton1Click:Connect(callback)
    end
    
    return Button
end

-- Função para criar toggle
function RNUI:Toggle(text, default, callback)
    if not self.ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local ToggleContainer = Instance.new("Frame")
    ToggleContainer.Size = UDim2.new(1, 0, 0, 30)
    ToggleContainer.BackgroundTransparency = 1
    ToggleContainer.Parent = self.ScrollFrame
    
    local ToggleButton = Instance.new("TextButton")
    ToggleButton.Size = UDim2.new(1, 0, 1, 0)
    ToggleButton.BackgroundTransparency = 1
    ToggleButton.Text = "  " .. text
    ToggleButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    ToggleButton.Font = Enum.Font.SourceSansBold
    ToggleButton.TextSize = 16
    ToggleButton.TextXAlignment = Enum.TextXAlignment.Left
    ToggleButton.Parent = ToggleContainer
    
    local ToggleBox = Instance.new("Frame")
    ToggleBox.Size = UDim2.new(0, 20, 0, 20)
    ToggleBox.Position = UDim2.new(1, -25, 0.5, -10)
    ToggleBox.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
    ToggleBox.Parent = ToggleButton
    
    local ToggleCorner = Instance.new("UICorner")
    ToggleCorner.CornerRadius = UDim.new(0, 4)
    ToggleCorner.Parent = ToggleBox
    
    local ToggleState = default or false
    
    local function updateToggle()
        if ToggleState then
            ToggleBox.BackgroundColor3 = Color3.fromRGB(0, 170, 255)
        else
            ToggleBox.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
        end
    end
    
    ToggleButton.MouseButton1Click:Connect(function()
        ToggleState = not ToggleState
        updateToggle()
        if type(callback) == "function" then
            callback(ToggleState)
        end
    end)
    
    updateToggle()
    
    return ToggleContainer
end

-- Função para criar dropdown
function RNUI:Dropdown(text, options, default, callback)
    if not self.ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local DropdownButton = Instance.new("TextButton")
    DropdownButton.Size = UDim2.new(1, 0, 0, 35)
    DropdownButton.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    DropdownButton.Text = text .. ": " .. (default or options[1])
    DropdownButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    DropdownButton.Font = Enum.Font.SourceSansBold
    DropdownButton.TextSize = 16
    DropdownButton.Parent = self.ScrollFrame
    
    local DropdownCorner = Instance.new("UICorner")
    DropdownCorner.CornerRadius = UDim.new(0, 6)
    DropdownCorner.Parent = DropdownButton
    
    -- Seta indicadora
    local Arrow = Instance.new("TextLabel")
    Arrow.Size = UDim2.new(0, 20, 0, 20)
    Arrow.Position = UDim2.new(1, -25, 0.5, -10)
    Arrow.BackgroundTransparency = 1
    Arrow.Text = "▼"
    Arrow.TextColor3 = Color3.fromRGB(200, 200, 200)
    Arrow.Font = Enum.Font.SourceSansBold
    Arrow.TextSize = 14
    Arrow.Parent = DropdownButton
    
    return DropdownButton
end

-- Função para criar label
function RNUI:Label(text)
    if not self.ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local Label = Instance.new("TextLabel")
    Label.Size = UDim2.new(1, 0, 0, 25)
    Label.BackgroundTransparency = 1
    Label.Text = text
    Label.TextColor3 = Color3.fromRGB(255, 255, 255)
    Label.Font = Enum.Font.SourceSansBold
    Label.TextSize = 16
    Label.TextXAlignment = Enum.TextXAlignment.Left
    Label.Parent = self.ScrollFrame
    
    return Label
end

-- Função para criar separador
function RNUI:Separator()
    if not self.ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local Separator = Instance.new("Frame")
    Separator.Size = UDim2.new(1, 0, 0, 1)
    Separator.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
    Separator.BorderSizePixel = 0
    Separator.Parent = self.ScrollFrame
    
    return Separator
end

-- Função para destruir a UI
function RNUI:Destroy()
    if ScreenGui then
        ScreenGui:Destroy()
        ScreenGui = nil
    end
end

return RNUI
