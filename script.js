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
local ScrollFrame
local UIListLayout

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
    
    -- ScrollingFrame PRINCIPAL (sem barra de rolagem visível)
    ScrollFrame = Instance.new("ScrollingFrame")
    ScrollFrame.Size = UDim2.new(1, -10, 1, -60)
    ScrollFrame.Position = UDim2.new(0, 5, 0, 35)
    ScrollFrame.BackgroundTransparency = 1
    ScrollFrame.BorderSizePixel = 0
    ScrollFrame.ScrollBarThickness = 0  -- BARRA INVISÍVEL
    ScrollFrame.ScrollBarImageTransparency = 1  -- TOTALMENTE TRANSPARENTE
    ScrollFrame.ClipsDescendants = true
    ScrollFrame.Parent = MainFrame
    
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
    
    -- Background para drag (cobre toda a janela)
    local BackgroundDrag = Instance.new("Frame")
    BackgroundDrag.Size = UDim2.new(1, 0, 1, 0)
    BackgroundDrag.BackgroundTransparency = 1
    BackgroundDrag.BorderSizePixel = 0
    BackgroundDrag.ZIndex = 0
    BackgroundDrag.Parent = MainFrame
    
    -- Sistema de Drag para MOUSE e CELULAR
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
    
    -- Conectar drag na TitleBar e no Background
    connectDragEvents(TitleBar)
    connectDragEvents(BackgroundDrag)
    
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
            -- Minimizar com animação
            local tween = TweenService:Create(
                MainFrame,
                TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = minimizedSize}
            )
            tween:Play()
            ScrollFrame.Visible = false
            Creditos.Visible = false
            BackgroundDrag.Visible = false
            MinimizeButton.Text = "+"
        else
            -- Restaurar com animação
            local tween = TweenService:Create(
                MainFrame,
                TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = originalSize}
            )
            tween:Play()
            ScrollFrame.Visible = true
            Creditos.Visible = true
            BackgroundDrag.Visible = true
            MinimizeButton.Text = "-"
        end
    end)
    
    -- Auto-ajuste de altura COM LIMITE
    local function ajustarAlturaJanela()
        if isMinimized then return end
        
        local alturaMinima = 220  -- Altura mínima
        local alturaMaxima = 400  -- Altura máxima
        local alturaConteudo = UIListLayout.AbsoluteContentSize.Y + 80
        
        -- Aplicar limites
        local novaAltura = math.clamp(alturaConteudo, alturaMinima, alturaMaxima)
        
        local tween = TweenService:Create(
            MainFrame,
            TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {Size = UDim2.new(0, 250, 0, novaAltura)}
        )
        tween:Play()
        
        -- Atualizar canvas size para rolagem
        ScrollFrame.CanvasSize = UDim2.new(0, 0, 0, UIListLayout.AbsoluteContentSize.Y)
    end
    
    UIListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(ajustarAlturaJanela)
    
    -- Ajuste inicial
    task.wait(0.1)
    ajustarAlturaJanela()
    
    return self
end

-- Função para criar botão
function RNUI:Button(text, callback)
    if not ScrollFrame then
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
    Button.Parent = ScrollFrame
    
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
    if not ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local ToggleContainer = Instance.new("Frame")
    ToggleContainer.Size = UDim2.new(1, 0, 0, 30)
    ToggleContainer.BackgroundTransparency = 1
    ToggleContainer.Parent = ScrollFrame
    
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
    if not ScrollFrame then
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
    DropdownButton.Parent = ScrollFrame
    
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
    
    -- Container da lista
    local DropdownContainer = Instance.new("ScrollingFrame")
    DropdownContainer.Size = UDim2.new(0, 240, 0, 0)
    DropdownContainer.Position = UDim2.new(0, 0, 0, 0)
    DropdownContainer.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
    DropdownContainer.BorderSizePixel = 0
    DropdownContainer.ClipsDescendants = true
    DropdownContainer.Visible = false
    DropdownContainer.ZIndex = 100
    DropdownContainer.ScrollBarThickness = 0  -- Sem barra aqui também
    DropdownContainer.ScrollBarImageTransparency = 1
    DropdownContainer.Parent = ScreenGui
    
    local DropdownContainerCorner = Instance.new("UICorner")
    DropdownContainerCorner.CornerRadius = UDim.new(0, 6)
    DropdownContainerCorner.Parent = DropdownContainer
    
    local DropdownLayout = Instance.new("UIListLayout")
    DropdownLayout.Padding = UDim.new(0, 2)
    DropdownLayout.Parent = DropdownContainer
    
    local selectedOption = default or options[1]
    local isOpen = false
    
    -- Calcular altura da lista
    local maxHeight = 150
    local optionHeight = 32
    local totalContentHeight = #options * optionHeight
    local finalHeight = math.min(totalContentHeight, maxHeight)
    
    -- Criar opções
    for _, option in ipairs(options) do
        local OptionButton = Instance.new("TextButton")
        OptionButton.Size = UDim2.new(1, 0, 0, 30)
        OptionButton.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
        OptionButton.Text = option
        OptionButton.TextColor3 = Color3.fromRGB(255, 255, 255)
        OptionButton.Font = Enum.Font.SourceSans
        OptionButton.TextSize = 14
        OptionButton.ZIndex = 101
        OptionButton.Parent = DropdownContainer
        
        local OptionCorner = Instance.new("UICorner")
        OptionCorner.CornerRadius = UDim.new(0, 4)
        OptionCorner.Parent = OptionButton
        
        -- Efeitos hover
        OptionButton.MouseEnter:Connect(function()
            OptionButton.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
        end)
        
        OptionButton.MouseLeave:Connect(function()
            OptionButton.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
        end)
        
        -- Selecionar opção
        OptionButton.MouseButton1Click:Connect(function()
            selectedOption = option
            DropdownButton.Text = text .. ": " .. option
            isOpen = false
            
            -- Fechar dropdown com animação
            local closeTween = TweenService:Create(
                DropdownContainer,
                TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = UDim2.new(0, 240, 0, 0)}
            )
            closeTween:Play()
            
            task.wait(0.2)
            DropdownContainer.Visible = false
            Arrow.Text = "▼"
            
            -- Callback
            if type(callback) == "function" then
                callback(option)
            end
        end)
    end
    
    DropdownContainer.CanvasSize = UDim2.new(0, 0, 0, totalContentHeight)
    
    -- Reposicionar lista
    local function repositionDropdown()
        if isOpen then
            local buttonPos = DropdownButton.AbsolutePosition
            local buttonSize = DropdownButton.AbsoluteSize
            
            DropdownContainer.Position = UDim2.new(
                0, buttonPos.X,
                0, buttonPos.Y + buttonSize.Y + 5
            )
        end
    end
    
    -- Abrir/fechar dropdown
    DropdownButton.MouseButton1Click:Connect(function()
        if isOpen then
            isOpen = false
            local closeTween = TweenService:Create(
                DropdownContainer,
                TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = UDim2.new(0, 240, 0, 0)}
            )
            closeTween:Play()
            task.wait(0.2)
            DropdownContainer.Visible = false
            Arrow.Text = "▼"
        else
            isOpen = true
            repositionDropdown()
            DropdownContainer.Visible = true
            local openTween = TweenService:Create(
                DropdownContainer,
                TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = UDim2.new(0, 240, 0, finalHeight)}
            )
            openTween:Play()
            Arrow.Text = "▲"
        end
    end)
    
    -- Reposicionar quando a janela se mover
    MainFrame:GetPropertyChangedSignal("Position"):Connect(function()
        if isOpen then
            repositionDropdown()
        end
    end)
    
    -- Efeitos hover no botão principal
    DropdownButton.MouseEnter:Connect(function()
        if not isOpen then
            DropdownButton.BackgroundColor3 = Color3.fromRGB(70, 70, 70)
        end
    end)
    
    DropdownButton.MouseLeave:Connect(function()
        if not isOpen then
            DropdownButton.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
        end
    end)
    
    return DropdownButton
end

-- Adicionar esta função na sua UI Library
function RNUI:TextBox(labelText, placeholder, callback)
    if not ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local TextContainer = Instance.new("Frame")
    TextContainer.Size = UDim2.new(1, 0, 0, 30)
    TextContainer.BackgroundTransparency = 1
    TextContainer.Parent = ScrollFrame
    
    local TextLabel = Instance.new("TextLabel")
    TextLabel.Size = UDim2.new(0.6, 0, 1, 0)
    TextLabel.BackgroundTransparency = 1
    TextLabel.Text = labelText
    TextLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    TextLabel.Font = Enum.Font.SourceSansBold
    TextLabel.TextSize = 16
    TextLabel.TextXAlignment = Enum.TextXAlignment.Left
    TextLabel.Parent = TextContainer
    
    local TextBox = Instance.new("TextBox")
    TextBox.Size = UDim2.new(0.3, 0, 1, 0)
    TextBox.Position = UDim2.new(0.65, 0, 0, 0)
    TextBox.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    TextBox.Text = placeholder or ""
    TextBox.PlaceholderText = placeholder or "Digite..."
    TextBox.TextColor3 = Color3.fromRGB(255, 255, 255)
    TextBox.Font = Enum.Font.SourceSansBold
    TextBox.TextSize = 16
    TextBox.Parent = TextContainer
    
    local TextBoxCorner = Instance.new("UICorner")
    TextBoxCorner.CornerRadius = UDim.new(0, 6)
    TextBoxCorner.Parent = TextBox
    
    -- Efeitos hover
    TextBox.MouseEnter:Connect(function()
        TextBox.BackgroundColor3 = Color3.fromRGB(70, 70, 70)
    end)
    
    TextBox.MouseLeave:Connect(function()
        TextBox.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    end)
    
    -- Callback quando perde foco
    if type(callback) == "function" then
        TextBox.FocusLost:Connect(function(enterPressed)
            if enterPressed then
                callback(TextBox.Text)
            end
        end)
    end
    
    return TextContainer, TextBox
end

-- Adicionar esta função na UI Library
function RNUI:EventSystem(eventConfig, eventList, activateText)
    if not ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local selectedEvent = eventList[1] -- Primeiro evento como padrão
    
    -- Dropdown para selecionar evento
    local EventDropdown = self:Dropdown("Selecionar Evento", eventList, eventList[1], function(event)
        selectedEvent = event
        print("🎯 Evento selecionado:", event)
    end)
    
    -- Botão para ativar evento
    local ActivateButton = self:Button(activateText or "🚀 ATIVAR EVENTO", function()
        if selectedEvent and eventConfig[selectedEvent] then
            print("🎯 Executando evento:", selectedEvent)
            eventConfig[selectedEvent]() -- Executa a função do evento
        else
            print("❌ Evento não encontrado ou não selecionado")
        end
    end)
    
    return EventDropdown, ActivateButton
end

-- Função para criar label
function RNUI:Label(text)
    if not ScrollFrame then
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
    Label.Parent = ScrollFrame
    
    return Label
end

-- Função para criar separador
function RNUI:Separator()
    if not ScrollFrame then
        warn("UI não inicializada. Chame RNUI:Init() primeiro.")
        return nil
    end
    
    local Separator = Instance.new("Frame")
    Separator.Size = UDim2.new(1, 0, 0, 1)
    Separator.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
    Separator.BorderSizePixel = 0
    Separator.Parent = ScrollFrame
    
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


