-- UI Library por RN TEAM - VERSÃO CORRIGIDA
local RN_UI = {}

-- Serviços
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")

-- Variáveis globais da UI
local LocalPlayer = Players.LocalPlayer
local ScreenGui, Frame, ContentContainer, UIListLayout
local elementos = {}

-- Configuração de dragging
local dragging, dragInput, dragStart, startPos

function RN_UI:CreateWindow(nome, tamanho, posicao)
    -- Esperar o player carregar
    if not LocalPlayer then
        LocalPlayer = Players.LocalPlayer
    end
    
    -- Criar a GUI principal
    ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Name = "RNTEAM_UI"
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
    ScreenGui.ResetOnSpawn = false
    ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

    -- Frame principal
    Frame = Instance.new("Frame")
    Frame.Size = tamanho or UDim2.new(0, 250, 0, 220)
    Frame.Position = posicao or UDim2.new(0.35, 0, 0.3, 0)
    Frame.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
    Frame.BorderSizePixel = 0
    Frame.Parent = ScreenGui
    Frame.ZIndex = 1
    
    local UICorner = Instance.new("UICorner")
    UICorner.CornerRadius = UDim.new(0, 8)
    UICorner.Parent = Frame

    -- Title Bar
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1, 0, 0, 30)
    TitleBar.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    TitleBar.BorderSizePixel = 0
    TitleBar.Parent = Frame
    TitleBar.ZIndex = 2
    
    local TitleBarCorner = Instance.new("UICorner")
    TitleBarCorner.CornerRadius = UDim.new(0, 8)
    TitleBarCorner.Parent = TitleBar

    -- Título
    local Titulo = Instance.new("TextLabel")
    Titulo.Size = UDim2.new(0.8, 0, 1, 0)
    Titulo.Position = UDim2.new(0.1, 0, 0, 0)
    Titulo.BackgroundTransparency = 1
    Titulo.Text = nome or "RN TEAM"
    Titulo.TextColor3 = Color3.fromRGB(255, 255, 255)
    Titulo.Font = Enum.Font.SourceSansBold
    Titulo.TextSize = 16
    Titulo.TextXAlignment = Enum.TextXAlignment.Center
    Titulo.Parent = TitleBar
    Titulo.ZIndex = 3

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
    MinimizeButton.ZIndex = 3

    -- Container de conteúdo
    ContentContainer = Instance.new("ScrollingFrame")
    ContentContainer.Size = UDim2.new(1, -10, 1, -60)
    ContentContainer.Position = UDim2.new(0, 5, 0, 35)
    ContentContainer.BackgroundTransparency = 1
    ContentContainer.BorderSizePixel = 0
    ContentContainer.ScrollBarThickness = 4
    ContentContainer.ScrollBarImageColor3 = Color3.fromRGB(100, 100, 100)
    ContentContainer.ClipsDescendants = true
    ContentContainer.Parent = Frame
    ContentContainer.ZIndex = 1

    UIListLayout = Instance.new("UIListLayout")
    UIListLayout.Padding = UDim.new(0, 10)
    UIListLayout.Parent = ContentContainer

    -- Créditos
    local Creditos = Instance.new("TextLabel")
    Creditos.Size = UDim2.new(1, 0, 0, 30)
    Creditos.Position = UDim2.new(0, 0, 1, -30)
    Creditos.BackgroundTransparency = 1
    Creditos.Text = "YouTube: RN_TEAM"
    Creditos.TextColor3 = Color3.fromRGB(200, 200, 200)
    Creditos.Font = Enum.Font.SourceSansBold
    Creditos.TextSize = 16
    Creditos.Parent = Frame
    Creditos.ZIndex = 1

    -- Background para dragging
    local BackgroundDrag = Instance.new("Frame")
    BackgroundDrag.Size = UDim2.new(1, 0, 1, 0)
    BackgroundDrag.BackgroundTransparency = 1
    BackgroundDrag.BorderSizePixel = 0
    BackgroundDrag.ZIndex = 0
    BackgroundDrag.Parent = Frame

    -- Sistema de dragging
    local function update(input)
        local delta = input.Position - dragStart
        Frame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
    end

    local function connectDragEvents(frame)
        frame.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                dragging = true
                dragStart = input.Position
                startPos = Frame.Position
                
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

    connectDragEvents(TitleBar)
    connectDragEvents(BackgroundDrag)

    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging then
            update(input)
        end
    end)

    -- Sistema de minimizar
    local isMinimized = false
    local originalSize = Frame.Size
    local minimizedSize = UDim2.new(0, Frame.Size.X.Offset, 0, 30)

    MinimizeButton.MouseButton1Click:Connect(function()
        isMinimized = not isMinimized
        
        if isMinimized then
            local tween = TweenService:Create(
                Frame,
                TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = minimizedSize}
            )
            tween:Play()
            ContentContainer.Visible = false
            Creditos.Visible = false
            BackgroundDrag.Visible = false
            MinimizeButton.Text = "+"
        else
            local tween = TweenService:Create(
                Frame,
                TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = originalSize}
            )
            tween:Play()
            ContentContainer.Visible = true
            Creditos.Visible = true
            BackgroundDrag.Visible = true
            MinimizeButton.Text = "-"
        end
    end)

    -- Ajuste automático de altura
    local function ajustarAlturaJanela()
        local alturaMinima = 220
        local alturaMaxima = 400
        local alturaConteudo = UIListLayout.AbsoluteContentSize.Y + 80
        
        local novaAltura = math.clamp(alturaConteudo, alturaMinima, alturaMaxima)
        
        local tween = TweenService:Create(
            Frame,
            TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {Size = UDim2.new(0, Frame.Size.X.Offset, 0, novaAltura)}
        )
        tween:Play()
        
        ContentContainer.CanvasSize = UDim2.new(0, 0, 0, UIListLayout.AbsoluteContentSize.Y)
    end

    UIListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(ajustarAlturaJanela)
    
    -- Ajustar inicialmente após um delay
    task.spawn(function()
        task.wait(0.5)
        ajustarAlturaJanela()
    end)

    print("✅ RN TEAM UI Carregada com Sucesso!")
    return {
        ScreenGui = ScreenGui,
        Frame = Frame,
        ContentContainer = ContentContainer
    }
end

function RN_UI:CreateButton(texto, callback)
    if not ContentContainer then
        warn("❌ ContentContainer não encontrado. Chame CreateWindow primeiro!")
        return
    end
    
    local Botao = Instance.new("TextButton")
    Botao.Size = UDim2.new(1, 0, 0, 35)
    Botao.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    Botao.Text = texto
    Botao.TextColor3 = Color3.fromRGB(255, 255, 255)
    Botao.Font = Enum.Font.SourceSansBold
    Botao.TextSize = 18
    Botao.ZIndex = 5
    Botao.Parent = ContentContainer
    
    local UICorner = Instance.new("UICorner")
    UICorner.CornerRadius = UDim.new(0, 6)
    UICorner.Parent = Botao

    Botao.MouseEnter:Connect(function()
        Botao.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
    end)
    
    Botao.MouseLeave:Connect(function()
        Botao.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    end)

    Botao.MouseButton1Click:Connect(callback)
    
    table.insert(elementos, Botao)
    return Botao
end

-- ... (as outras funções CreateToggle, CreateDropdown permanecem iguais)

return RN_UI
