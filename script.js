local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local CoreGui = game:GetService("CoreGui")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
ScreenGui.ResetOnSpawn = false

local dragging
local dragInput
local dragStart
local startPos

local Frame = Instance.new("Frame")
Frame.Size = UDim2.new(0, 250, 0, 220)
Frame.Position = UDim2.new(0.35, 0, 0.3, 0)
Frame.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
Frame.BorderSizePixel = 0
Frame.Parent = ScreenGui
Instance.new("UICorner", Frame).CornerRadius = UDim.new(0, 8)

local TitleBar = Instance.new("Frame")
TitleBar.Size = UDim2.new(1, 0, 0, 30)
TitleBar.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
TitleBar.BorderSizePixel = 0
TitleBar.Parent = Frame
Instance.new("UICorner", TitleBar).CornerRadius = UDim.new(0, 8)

local Titulo = Instance.new("TextLabel")
Titulo.Size = UDim2.new(0.8, 0, 1, 0)
Titulo.Position = UDim2.new(0.1, 0, 0, 0)
Titulo.BackgroundTransparency = 1
Titulo.Text = "RN TEAM"
Titulo.TextColor3 = Color3.fromRGB(255, 255, 255)
Titulo.Font = Enum.Font.SourceSansBold
Titulo.TextSize = 16
Titulo.TextXAlignment = Enum.TextXAlignment.Center
Titulo.Parent = TitleBar

local MinimizeButton = Instance.new("TextButton")
MinimizeButton.Size = UDim2.new(0, 30, 0, 30)
MinimizeButton.Position = UDim2.new(1, -30, 0, 0)
MinimizeButton.BackgroundTransparency = 1
MinimizeButton.Text = "-"
MinimizeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
MinimizeButton.Font = Enum.Font.SourceSansBold
MinimizeButton.TextSize = 20
MinimizeButton.Parent = TitleBar

local ContentContainer = Instance.new("ScrollingFrame")
ContentContainer.Size = UDim2.new(1, -10, 1, -60)
ContentContainer.Position = UDim2.new(0, 5, 0, 35)
ContentContainer.BackgroundTransparency = 1
ContentContainer.BorderSizePixel = 0
ContentContainer.ScrollBarThickness = 0
ContentContainer.ScrollBarImageColor3 = Color3.fromRGB(0, 0, 0)
ContentContainer.ScrollBarImageTransparency = 1
ContentContainer.ClipsDescendants = true
ContentContainer.Parent = Frame

local UIListLayout = Instance.new("UIListLayout")
UIListLayout.Padding = UDim.new(0, 10)
UIListLayout.Parent = ContentContainer

local Creditos = Instance.new("TextLabel")
Creditos.Size = UDim2.new(1, 0, 0, 30)
Creditos.Position = UDim2.new(0, 0, 1, -30)
Creditos.BackgroundTransparency = 1
Creditos.Text = "YouTube: RN_TEAM"
Creditos.TextColor3 = Color3.fromRGB(200, 200, 200)
Creditos.Font = Enum.Font.SourceSansBold
Creditos.TextSize = 16
Creditos.Parent = Frame

local BackgroundDrag = Instance.new("Frame")
BackgroundDrag.Size = UDim2.new(1, 0, 1, 0)
BackgroundDrag.BackgroundTransparency = 1
BackgroundDrag.BorderSizePixel = 0
BackgroundDrag.ZIndex = 0
BackgroundDrag.Parent = Frame

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

local function ajustarAlturaJanela()
    local alturaMinima = 220
    local alturaMaxima = 400
    local alturaConteudo = UIListLayout.AbsoluteContentSize.Y + 80
    
    local novaAltura = math.clamp(alturaConteudo, alturaMinima, alturaMaxima)
    
    local tween = TweenService:Create(
        Frame,
        TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
        {Size = UDim2.new(0, 250, 0, novaAltura)}
    )
    tween:Play()
    
    ContentContainer.CanvasSize = UDim2.new(0, 0, 0, UIListLayout.AbsoluteContentSize.Y)
end

local isMinimized = false
local originalSize = Frame.Size
local minimizedSize = UDim2.new(0, 250, 0, 30)

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

local function CriarBotao(texto, callback)
	local Botao = Instance.new("TextButton")
	Botao.Size = UDim2.new(1, 0, 0, 35)
	Botao.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
	Botao.Text = texto
	Botao.TextColor3 = Color3.fromRGB(255, 255, 255)
	Botao.Font = Enum.Font.SourceSansBold
	Botao.TextSize = 18
	Botao.ZIndex = 1
	Botao.Parent = ContentContainer
	Instance.new("UICorner", Botao).CornerRadius = UDim.new(0, 6)

	Botao.MouseEnter:Connect(function()
		Botao.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
	end)
	Botao.MouseLeave:Connect(function()
		Botao.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
	end)

	Botao.MouseButton1Click:Connect(callback)
	return Botao
end

local function CriarToggle(texto, callback)
    local ToggleContainer = Instance.new("Frame")
    ToggleContainer.Size = UDim2.new(1, 0, 0, 30)
    ToggleContainer.BackgroundTransparency = 1
    ToggleContainer.ZIndex = 1
    ToggleContainer.Parent = ContentContainer

    local Toggle = Instance.new("TextButton")
    Toggle.Size = UDim2.new(1, 0, 1, 0)
    Toggle.BackgroundTransparency = 1
    Toggle.Text = texto
    Toggle.TextColor3 = Color3.fromRGB(255, 255, 255)
    Toggle.Font = Enum.Font.SourceSansBold
    Toggle.TextSize = 18
    Toggle.TextXAlignment = Enum.TextXAlignment.Left
    Toggle.ZIndex = 1
    Toggle.Parent = ToggleContainer

    local Box = Instance.new("Frame", Toggle)
    Box.Size = UDim2.new(0, 20, 0, 20)
    Box.Position = UDim2.new(1, -25, 0.5, -10)
    Box.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
    Box.ZIndex = 1
    Instance.new("UICorner", Box).CornerRadius = UDim.new(0, 4)

    return Toggle, Box
end

local function CriarBotaoSelecao(textoInicial, opcoes, callback)
    local BotaoSelecao = Instance.new("TextButton")
    BotaoSelecao.Size = UDim2.new(1, 0, 0, 35)
    BotaoSelecao.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    BotaoSelecao.Text = textoInicial
    BotaoSelecao.TextColor3 = Color3.fromRGB(255, 255, 255)
    BotaoSelecao.Font = Enum.Font.SourceSansBold
    BotaoSelecao.TextSize = 18
    BotaoSelecao.ZIndex = 2
    BotaoSelecao.Parent = ContentContainer
    Instance.new("UICorner", BotaoSelecao).CornerRadius = UDim.new(0, 6)

    -- Seta indicadora
    local Seta = Instance.new("TextLabel")
    Seta.Size = UDim2.new(0, 20, 0, 20)
    Seta.Position = UDim2.new(1, -25, 0.5, -10)
    Seta.BackgroundTransparency = 1
    Seta.Text = "▼"
    Seta.TextColor3 = Color3.fromRGB(200, 200, 200)
    Seta.Font = Enum.Font.SourceSansBold
    Seta.TextSize = 14
    Seta.ZIndex = 2
    Seta.Parent = BotaoSelecao

    local ListaContainer = Instance.new("ScrollingFrame")
    ListaContainer.Size = UDim2.new(0, 240, 0, 0)
    ListaContainer.Position = UDim2.new(0, 0, 0, 0)
    ListaContainer.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
    ListaContainer.BorderSizePixel = 0
    ListaContainer.ClipsDescendants = true
    ListaContainer.Visible = false
    ListaContainer.ZIndex = 100
    ListaContainer.ScrollBarThickness = 0
    ListaContainer.ScrollBarImageTransparency = 1
    ListaContainer.Parent = ScreenGui
    Instance.new("UICorner", ListaContainer).CornerRadius = UDim.new(0, 6)

    local ListaLayout = Instance.new("UIListLayout")
    ListaLayout.Padding = UDim.new(0, 2)
    ListaLayout.Parent = ListaContainer

    local opcaoSelecionada = textoInicial
    local listaAberta = false

    local alturaMaximaLista = 150
    local alturaPorOpcao = 32
    local espacamento = 2
    local alturaTotalConteudo = #opcoes * (alturaPorOpcao + espacamento) - espacamento
    
    local alturaFinalLista = math.min(alturaTotalConteudo, alturaMaximaLista)

    for _, opcao in ipairs(opcoes) do
        local OpcaoBotao = Instance.new("TextButton")
        OpcaoBotao.Size = UDim2.new(1, 0, 0, 30)
        OpcaoBotao.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
        OpcaoBotao.Text = opcao
        OpcaoBotao.TextColor3 = Color3.fromRGB(255, 255, 255)
        OpcaoBotao.Font = Enum.Font.SourceSans
        OpcaoBotao.TextSize = 16
        OpcaoBotao.ZIndex = 101
        OpcaoBotao.Parent = ListaContainer
        Instance.new("UICorner", OpcaoBotao).CornerRadius = UDim.new(0, 4)

        OpcaoBotao.MouseEnter:Connect(function()
            OpcaoBotao.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
        end)
        OpcaoBotao.MouseLeave:Connect(function()
            OpcaoBotao.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
        end)

        OpcaoBotao.MouseButton1Click:Connect(function()
            opcaoSelecionada = opcao
            BotaoSelecao.Text = opcao
            listaAberta = false
            
            local tween = TweenService:Create(
                ListaContainer,
                TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = UDim2.new(0, 240, 0, 0)}
            )
            tween:Play()
            
            task.wait(0.2)
            ListaContainer.Visible = false
            Seta.Text = "▼"
            
            if callback then
                callback(opcao)
            end
        end)
    end

    ListaContainer.CanvasSize = UDim2.new(0, 0, 0, alturaTotalConteudo)

    local function reposicionarLista()
        if listaAberta then
            local posicaoBotao = BotaoSelecao.AbsolutePosition
            local tamanhoBotao = BotaoSelecao.AbsoluteSize
            
            -- Posiciona a lista logo abaixo do botão
            ListaContainer.Position = UDim2.new(
                0, posicaoBotao.X,
                0, posicaoBotao.Y + tamanhoBotao.Y + 5
            )
        end
    end

    BotaoSelecao.MouseButton1Click:Connect(function()
        if listaAberta then
            listaAberta = false
            local tween = TweenService:Create(
                ListaContainer,
                TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = UDim2.new(0, 240, 0, 0)}
            )
            tween:Play()
            task.wait(0.2)
            ListaContainer.Visible = false
            Seta.Text = "▼"
        else
            listaAberta = true
            reposicionarLista()
            ListaContainer.Visible = true
            local tween = TweenService:Create(
                ListaContainer,
                TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {Size = UDim2.new(0, 240, 0, alturaFinalLista)}
            )
            tween:Play()
            Seta.Text = "▲"
        end
    end)

    Frame:GetPropertyChangedSignal("Position"):Connect(function()
        if listaAberta then
            reposicionarLista()
        end
    end)

    BotaoSelecao.MouseEnter:Connect(function()
        if not listaAberta then
            BotaoSelecao.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
        end
    end)
    BotaoSelecao.MouseLeave:Connect(function()
        if not listaAberta then
            BotaoSelecao.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
        end
    end)

    return BotaoSelecao
end

UIListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(ajustarAlturaJanela)
task.wait(0.1)
ajustarAlturaJanela()