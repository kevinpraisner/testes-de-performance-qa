# 🚀 Performance Testing Portfolio — Apache JMeter

Projeto de portfólio demonstrando um ciclo completo de **testes de performance** com Apache JMeter — do planejamento à análise de resultados, cobrindo Smoke, Load, Stress e Spike Test.

**Sistema sob teste:** [blazedemo.com](https://blazedemo.com) — aplicação de compra de passagens aéreas disponibilizada publicamente para fins de teste.

---

## 📁 Estrutura do Projeto

```
jmeter-performance-portifolio/
├── tests/
│   ├── scenarios/
│   │   └── blazedemo_full_flow.jmx   # Plano de teste principal
│   └── data/
│       └── flights.csv               # Massa de dados parametrizada (10 rotas)
├── results/                          # Arquivos .jtl gerados em runtime
│   ├── smoke_results.jtl
│   ├── load_results.jtl
│   ├── stress_results.jtl
│   └── spike_results.jtl
└── reports/                          # Dashboards HTML gerados pelo JMeter
    ├── smoke/
    ├── load/
    ├── stress/
    └── spike/
```

---

## 🎯 Fluxo de Negócio Testado

O teste simula a jornada completa de compra de passagem aérea no BlazeDemo:

```
TX-01: Home Page        GET  /               → Seleciona aeroportos
TX-02: Buscar Voos      POST /reserve.php    → Lista voos disponíveis
TX-03: Escolher Voo     POST /purchase.php   → Seleciona e preenche dados
TX-04: Confirmar Compra POST /confirmation.php → Finaliza a compra
```

### SLAs definidos por transação

| Transação | SLA de tempo | Error Rate máximo |
|---|---|---|
| TX-01: Home Page | < 3.000ms | 2% |
| TX-02: Buscar Voos | < 5.000ms | 2% |
| TX-03: Escolher Voo | < 5.000ms | 2% |
| TX-04: Confirmar Compra | < 8.000ms | 2% |

---

## 🧪 Tipos de Teste

| Tipo | Usuários | Ramp-up | Duração | Objetivo |
|---|---|---|---|---|
| **Smoke** | 1 | 1s | 60s | Validar baseline sem carga |
| **Load** | 50 | 60s | 180s | Simular carga esperada |
| **Stress** | 200 | 120s | 300s | Encontrar ponto de ruptura |
| **Spike** | 300 | 10s | 120s | Testar resiliência a picos |

---

## 📊 Resultados

### Comparativo geral

| Tipo | Usuários | Amostras | Média | P90 | P95 | Erro % | Throughput |
|---|---|---|---|---|---|---|---|
| Smoke | 1 | 30 | 488ms | 837ms | 992ms | **0,00%** | 0,5/s |
| Load | 50 | 10.334 | 709ms | 994ms | 1.697ms | **1,68%** | 56,6/s |
| Stress | 200 | 22.476 | 650ms | 1.134ms | 2.063ms | **0,71%** | 74,3/s |
| Spike | 300 | 16.011 | 687ms | 1.389ms | 2.446ms | **0,66%** | 131,0/s |

### Smoke Test — 1 usuário · 60s

| Transação | Média | P90 | P95 | P99 | Erro % |
|---|---|---|---|---|---|
| TX-01: Home Page | 812ms | 992ms | 2007ms | 2007ms | 0,00% |
| TX-02: Buscar Voos | 370ms | 372ms | 1156ms | 1156ms | 0,00% |
| TX-03: Escolher Voo | 386ms | 494ms | 496ms | 496ms | 0,00% |
| TX-04: Confirmar Compra | 356ms | 497ms | 500ms | 500ms | 0,00% |

✅ **0% de erro** — baseline validado.

---

### Load Test — 50 usuários · ramp 60s · duração 180s

| Transação | Média | P90 | P95 | P99 | Erro % |
|---|---|---|---|---|---|
| TX-01: Home Page | 843ms | 1.196ms | 1.727ms | 7.661ms | 3,42% |
| TX-02: Buscar Voos | 664ms | 911ms | 2.065ms | 6.854ms | 2,64% |
| TX-03: Escolher Voo | 681ms | 849ms | 1.807ms | 7.634ms | 0,00% |
| TX-04: Confirmar Compra | 646ms | 750ms | 1.639ms | 7.881ms | 0,59% |

⚠️ **TX-01 e TX-02 ultrapassaram o SLA de 2% de erro** — Home Page e Busca de Voos são os gargalos sob carga de 50 usuários simultâneos.

---

### Stress Test — 200 usuários · ramp 120s · duração 300s

| Transação | Média | P90 | P95 | P99 | Erro % |
|---|---|---|---|---|---|
| TX-01: Home Page | 794ms | 1.297ms | 2.271ms | 3.891ms | 2,76% |
| TX-02: Buscar Voos | 599ms | 1.031ms | 1.940ms | 3.801ms | 0,05% |
| TX-03: Escolher Voo | 599ms | 1.014ms | 1.888ms | 3.833ms | 0,00% |
| TX-04: Confirmar Compra | 606ms | 1.040ms | 2.140ms | 3.860ms | 0,00% |

🔍 **Comportamento interessante:** com 200 usuários o sistema se estabilizou melhor que com 50, graças ao ramp-up mais longo (120s). A Home Page ainda é o gargalo principal.

---

### Spike Test — 300 usuários · ramp 10s · duração 120s

| Transação | Média | P90 | P95 | P99 | Erro % |
|---|---|---|---|---|---|
| TX-01: Home Page | 835ms | 1.586ms | 2.574ms | 3.652ms | 2,56% |
| TX-02: Buscar Voos | 630ms | 1.282ms | 2.415ms | 3.597ms | 0,00% |
| TX-03: Escolher Voo | 638ms | 1.207ms | 2.393ms | 3.689ms | 0,00% |
| TX-04: Confirmar Compra | 639ms | 1.312ms | 2.405ms | 3.845ms | 0,00% |

✅ **Sistema resiliente ao pico:** mesmo com 300 usuários em ramp-up agressivo de 10s, a taxa de erro geral foi de apenas 0,66%. O BlazeDemo absorveu bem o pico.

---

## 🔍 Análise e Conclusões

### Gargalo identificado
A **TX-01 (Home Page)** foi consistentemente o endpoint mais frágil — ultrapassou o SLA de 2% de erro no Load, Stress e Spike Test. Em produção, seria o primeiro candidato a otimização (cache, CDN, ou revisão de infraestrutura).

### Ponto positivo
O sistema demonstrou **boa resiliência**: com ramp-up adequado (120s no Stress Test), a taxa de erro caiu para 0,71% mesmo com 200 usuários — abaixo do Load Test com 50 usuários. Isso indica que o servidor lida bem com carga sustentada, mas sofre em picos de conexões simultâneas.

### Throughput
O sistema escalou bem em throughput: de **0,5 req/s** no Smoke até **131 req/s** no Spike — um aumento de 260x mantendo taxa de erro abaixo de 3%.

---

## ⚙️ Estratégias implementadas

| Técnica | Descrição |
|---|---|
| **Parametrização CSV** | 10 combinações de rotas e usuários — cada thread usa dados diferentes |
| **Think Time gaussiano** | Pausas realistas entre transações (1s±300ms, 2s±500ms, 3s±1s) |
| **Correlation** | Extração dinâmica do CSRF token entre TX-03 e TX-04 via Regex Extractor |
| **Assertions multicamada** | HTTP status code + conteúdo da resposta + SLA de tempo por transação |
| **Transaction Controllers** | Agrupamento de requests para medir tempo total por etapa do fluxo |
| **Cookie Manager** | Gerenciamento de sessão com limpeza a cada iteração |
| **HTTP Request Defaults** | Configuração centralizada de servidor, protocolo e timeouts |

---

## 🚀 Como executar

### Pré-requisitos
- Java 17+
- Apache JMeter 5.6.3 ([download](https://jmeter.apache.org/download_jmeter.cgi))

### Executar via interface gráfica (Windows)
```bash
# Abrir o JMeter
C:\caminho\apache-jmeter-5.6.3\bin\jmeter.bat

# Abrir o arquivo de teste:
# tests/scenarios/blazedemo_full_flow.jmx
```

1. Habilite apenas o Thread Group desejado (botão direito → Habilitar)
2. Clique em **Executar** ou pressione `Ctrl + R`
3. Acompanhe os resultados no **Aggregate Report**

### Gerar relatório HTML
```bash
# Windows
jmeter.bat -g results\smoke_results.jtl -o reports\smoke

# Linux/macOS
jmeter -g results/smoke_results.jtl -o reports/smoke
```

---

## 📚 Conceitos aplicados

- **Smoke Test** — validação de sanidade antes de qualquer carga
- **Load Test** — comportamento sob carga esperada em produção
- **Stress Test** — identificação do ponto de ruptura do sistema
- **Spike Test** — resiliência a picos repentinos de usuários
- **APDEX Score** — índice de satisfação do usuário (satisfied < 500ms, tolerated < 1500ms)
- **Percentis P90/P95/P99** — distribuição real dos tempos de resposta
- **Correlation** — captura de valores dinâmicos entre requisições

---
