export type WorkedExample = {
  id: string;
  chapterId: string;
  sectionId: string;
  title: string;
  prompt: string;
  steps: string[];
  answer: string;
};

/** 每章一道从题干算到答案的例题。数字与讲义里的书上例题一致。 */
export const WORKED: WorkedExample[] = [
  {
    id: "w1",
    chapterId: "ch1",
    sectionId: "1.3",
    title: "例　√10 要几位才算保证",
    prompt:
      "为了使 $\\sqrt{10}$ 的近似值的相对误差小于 $0.01\\%$，应取几位有效数字？按式 (1.1) 的最坏上界回答，不要拿某一个碰巧很准的近似值充数。",
    steps: [
      "先写成书上的科学记数。$\\sqrt{10}\\approx 3.162=0.3162\\times 10^{1}$，首位不是 $0$，所以 $m=1$。",
      "$n$ 位有效数字的绝对误差限是\n\n$$\n\\varepsilon=\\tfrac12\\times 10^{m-n}=\\tfrac12\\times 10^{1-n}.\n$$\n\n相对误差限用这个数的大小作分母：\n\n$$\n\\varepsilon_r=\\frac{\\varepsilon}{\\sqrt{10}}.\n$$\n\n题目要求 $\\varepsilon_r<0.01\\%=10^{-4}$。",
      "四位：$n=4$，$\\varepsilon=\\tfrac12\\times 10^{-3}=5\\times 10^{-4}$。\n\n$$\n\\varepsilon_r=\\frac{5\\times 10^{-4}}{\\sqrt{10}}\\approx\\frac{0.0005}{3.162278}\\approx 1.581\\times 10^{-4}>10^{-4}.\n$$\n\n上界比题目要求宽，四位**不能保证**。",
      "五位：$n=5$，$\\varepsilon=\\tfrac12\\times 10^{-4}=5\\times 10^{-5}$。\n\n$$\n\\varepsilon_r=\\frac{5\\times 10^{-5}}{\\sqrt{10}}\\approx 1.581\\times 10^{-5}<10^{-4}.\n$$\n\n上界已经严于题目要求。",
      "核对“碰巧”。四舍五入到四位的 $3.162$，真实误差 $|\\sqrt{10}-3.162|\\approx 2.78\\times 10^{-4}$，相对误差约 $8.8\\times 10^{-5}$，确实小于 $10^{-4}$。这只说明这一个近似值够好，不是有效数字定义里的保证。指定题 1-3 要的是保证。",
    ],
    answer: "应取 **5** 位有效数字。四位的误差上界 $1.581\\times 10^{-4}$ 仍大于 $0.01\\%$。",
  },
  {
    id: "w2",
    chapterId: "ch2",
    sectionId: "2.2.2",
    title: "例 2-2　Doolittle 分解并求解",
    prompt:
      "用 Doolittle 分解（$L$ 的对角为 $1$）解\n\n$$\n\\begin{bmatrix}2&1&1\\\\4&4&3\\\\6&7&7\\end{bmatrix}\\begin{bmatrix}x_1\\\\x_2\\\\x_3\\end{bmatrix}=\\begin{bmatrix}3\\\\7\\\\13\\end{bmatrix}.\n$$",
    steps: [
      "公式按列推进。先 $U$ 的第 $k$ 行，再 $L$ 的第 $k$ 列：\n\n$$\nu_{kj}=a_{kj}-\\sum_{s<k}l_{ks}u_{sj},\\qquad l_{ik}=\\bigl(a_{ik}-\\sum_{s<k}l_{is}u_{sk}\\bigr)/u_{kk},\\qquad l_{kk}=1.\n$$",
      "$k=1$。$U$ 的第一行就是 $A$ 的第一行，乘数是第一列除以主元。\n\n$$\n\\begin{aligned}\nu_{11}&=2, & u_{12}&=1, & u_{13}&=1,\\\\\nl_{21}&=4/2=2, & l_{31}&=6/2=3.\n\\end{aligned}\n$$",
      "$k=2,3$。\n\n$$\n\\begin{aligned}\nu_{22}&=4-2\\times 1=2,\\\\\nu_{23}&=3-2\\times 1=1,\\\\\nl_{32}&=(7-3\\times 1)/2=2,\\\\\nu_{33}&=7-3\\times 1-2\\times 1=2.\n\\end{aligned}\n$$\n\n$$\nL=\\begin{bmatrix}1&0&0\\\\2&1&0\\\\3&2&1\\end{bmatrix},\\quad U=\\begin{bmatrix}2&1&1\\\\0&2&1\\\\0&0&2\\end{bmatrix}.\n$$\n\n检查：$U$ 的第一行必须等于 $(2,1,1)$。对不上，就是把 $L$ 和 $U$ 填反了。主元都不是 $0$，所以不用换行。",
      "回代 $Ly=b$，对角是 $1$，只做减法：\n\n$$\n\\begin{aligned}\ny_1&=3,\\\\\ny_2&=7-2\\times 3=1,\\\\\ny_3&=13-3\\times 3-2\\times 1=2.\n\\end{aligned}\n$$",
      "回代 $Ux=y$，从最后一行倒着来：\n\n$$\n\\begin{aligned}\n2x_3&=2\\Rightarrow x_3=1,\\\\\n2x_2+x_3&=1\\Rightarrow x_2=0,\\\\\n2x_1+x_2+x_3&=3\\Rightarrow x_1=1.\n\\end{aligned}\n$$",
      "代回原方程：\n\n$$\n2(1)+0+1=3,\\quad 4(1)+0+3=7,\\quad 6(1)+0+7=13.\n$$\n\n换一个右端时，$L,U$ 不用重算。",
    ],
    answer: "$x=(1,\\,0,\\,1)^T$。$y=(3,\\,1,\\,2)^T$。",
  },
  {
    id: "w3",
    chapterId: "ch3",
    sectionId: "3.1",
    title: "例 3-1　先判收敛，再算第一步",
    prompt:
      "方程组\n\n$$\n\\begin{cases}\n10x_1+3x_2+x_3=14,\\\\\n2x_1-10x_2+3x_3=-5,\\\\\nx_1+3x_2+10x_3=14.\n\\end{cases}\n$$\n\n精确解 $(1,1,1)^T$，初值 $x^{(0)}=0$。判断 Jacobi 与 Gauss–Seidel 是否收敛，并各算第一步。",
    steps: [
      "先写迭代式，对角元留在分母上。对角元是 $0$ 就要先换行。\n\n$$\n\\begin{aligned}\nx_1&=(14-3x_2-x_3)/10,\\\\\nx_2&=(-5-2x_1+3x_3)/(-10),\\\\\nx_3&=(14-x_1-3x_2)/10.\n\\end{aligned}\n$$",
      "严格对角占优，每一行都成立：\n\n$$\n\\lvert 10\\rvert>\\lvert 3\\rvert+\\lvert 1\\rvert,\\quad \\lvert-10\\rvert>\\lvert 2\\rvert+\\lvert 3\\rvert,\\quad \\lvert 10\\rvert>\\lvert 1\\rvert+\\lvert 3\\rvert.\n$$\n\n定理 3.4：Jacobi 和 Gauss–Seidel **都收敛**。有一行只是等于，这条就不能用。",
      "Jacobi：右边全用上一轮的 $0$。\n\n$$\nx_1^{(1)}=14/10=1.4,\\quad x_2^{(1)}=(-5)/(-10)=0.5,\\quad x_3^{(1)}=14/10=1.4.\n$$",
      "Gauss–Seidel：新算出来的马上用。它不是把 Jacobi 的结果再代一次。\n\n$$\n\\begin{aligned}\nx_1&=14/10=1.4,\\\\\nx_2&=(-5-2\\times 1.4)/(-10)=0.78,\\\\\nx_3&=(14-1.4-3\\times 0.78)/10=1.026.\n\\end{aligned}\n$$",
    ],
    answer:
      "两种迭代都收敛。Jacobi 第一步 $(1.4,\\,0.5,\\,1.4)^T$，Gauss–Seidel 第一步 $(1.4,\\,0.78,\\,1.026)^T$。",
  },
  {
    id: "w4",
    chapterId: "ch4",
    sectionId: "4.3",
    title: "例 4-5　Newton 法解 $xe^{x}=1$",
    prompt:
      "用 Newton 法求 $xe^{x}=1$ 的根。$x_0=0.5$，写出迭代公式、前两步，并说明收敛阶。",
    steps: [
      "令 $f(x)=xe^{x}-1$。则 $f'(x)=e^{x}(x+1)$。单根公式是\n\n$$\nx_{k+1}=x_k-\\frac{f(x_k)}{f'(x_k)}=x_k-\\frac{x_k-e^{-x_k}}{1+x_k}.\n$$\n\n$f'(\\alpha)\\ne 0$，所以至少二阶：\n\n$$\n\\lim\\frac{x_{k+1}-\\alpha}{(x_k-\\alpha)^2}=\\frac{f''(\\alpha)}{2f'(\\alpha)}=\\frac{\\alpha+2}{2(\\alpha+1)}.\n$$",
      "第一步，$e^{-0.5}\\approx 0.606530660$。\n\n$$\n\\begin{aligned}\nx_1&=0.5-\\frac{0.5-0.606530660}{1.5}\\\\\n&=0.5+\\frac{0.106530660}{1.5}=0.571020440.\n\\end{aligned}\n$$",
      "第二步，$e^{-0.571020440}\\approx 0.564948648$。\n\n$$\n\\begin{aligned}\nx_2&=0.571020440-\\frac{0.571020440-0.564948648}{1.571020440}\\\\\n&=0.571020440-\\frac{0.006071792}{1.571020440}=0.567155569.\n\\end{aligned}\n$$",
      "误差从 $0.067$ 收到 $0.0039$，再收到 $1.2\\times 10^{-5}$。大约按平方缩短，和二阶一致。再两步到 $x_4=0.567143290$，这就是书上表里的结果。重根才把减号后面改成 $m f/f'$；这里是单根，$m=1$。",
    ],
    answer: "$x_1=0.571020440$，$x_2=0.567155569$，根 $0.567143290$。单根，至少二阶。",
  },
  {
    id: "w6",
    chapterId: "ch6",
    sectionId: "6.2",
    title: "例 6-1　三点 Lagrange 求 $\\ln 11.25$",
    prompt:
      "用 $\\ln 10=2.302585$，$\\ln 11=2.397895$，$\\ln 12=2.484907$ 作二次插值，求 $\\ln 11.25$，并给误差上界。$(\\ln x)'''=2/x^3$。",
    steps: [
      "三个节点上的 Lagrange 公式：\n\n$$\nL_2(x)=\\sum_{i=0}^{2}y_i\\prod_{j\\ne i}\\frac{x-x_j}{x_i-x_j},\\qquad R_2(x)=\\frac{f'''(\\xi)}{3!}\\,(x-10)(x-11)(x-12).\n$$",
      "先把三个系数算出来，再代 $x=11.25$。\n\n$$\n\\begin{aligned}\n\\frac{2.302585}{(10-11)(10-12)}&=1.1512925,\\\\\n\\frac{2.397895}{(11-10)(11-12)}&=-2.397895,\\\\\n\\frac{2.484907}{(12-10)(12-11)}&=1.2424535.\n\\end{aligned}\n$$\n\n$$\n\\begin{aligned}\n1.1512925\\times 0.25\\times(-0.75)&=-0.215867,\\\\\n-2.397895\\times 1.25\\times(-0.75)&=2.248027,\\\\\n1.2424535\\times 1.25\\times 0.25&=0.388267,\\\\\nL_2(11.25)&=2.420426.\n\\end{aligned}\n$$",
      "真值 $\\ln 11.25\\approx 2.420368$，实际误差约 $5.78\\times 10^{-5}$。误差上界不能把这个真误差代进去：$\\xi$ 说不清在哪。\n\n在 $[10,12]$ 上 $|f'''|\\le 2/10^3=0.002$，所以\n\n$$\n|R_2|\\le\\frac{0.002}{6}\\,|1.25\\times 0.25\\times(-0.75)|=7.8125\\times 10^{-5}.\n$$\n\n书上收成“小于 $0.00007$”。手算交 $7.8125\\times 10^{-5}$ 即可，它确实盖住了实际误差。",
    ],
    answer: "$L_2(11.25)=2.420426$，误差上界 $7.8125\\times 10^{-5}$。",
  },
  {
    id: "w7",
    chapterId: "ch7",
    sectionId: "7.2",
    title: "例 7-5　误差小于 $10^{-6}$ 要分几段",
    prompt:
      "$$\nI=\\int_0^1\\frac{\\sin x}{x}\\,dx,\\quad f(0)=1,\\quad \\varepsilon=10^{-6}.\n$$\n\n已知 $|f''|\\le 1/3$，$|f^{(4)}|\\le 1/5$。复化梯形和复化 Simpson 各至少要多少段？",
    steps: [
      "这里 $h=(b-a)/n=1/n$ 是一大段的长度。余项估计是\n\n$$\n|I-T_n|\\le\\frac{(b-a)^3}{12n^2}M_2,\\qquad |I-S_n|\\le\\frac{(b-a)^5}{2880n^4}M_4.\n$$\n\n要小于 $\\varepsilon$，就反解\n\n$$\nn>\\sqrt{\\frac{(b-a)^3 M_2}{12\\varepsilon}},\\qquad n>\\left(\\frac{(b-a)^5 M_4}{2880\\varepsilon}\\right)^{1/4}.\n$$",
      "梯形。$b-a=1$，$M_2=1/3$，$\\varepsilon=10^{-6}$。\n\n$$\n\\frac{(1/3)}{12\\times 10^{-6}}=\\frac{1}{36\\times 10^{-6}},\\qquad n>\\sqrt{\\frac{1}{36\\times 10^{-6}}}=\\frac{1000}{6}\\approx 166.67.\n$$\n\n段数要超过这个数，取 $n=167$。",
      "Simpson。$M_4=1/5$。分母是 $2880$，不是单段公式里看起来像的 $180$。\n\n$$\n\\frac{1/5}{2880\\times 10^{-6}}=\\frac{1}{14400\\times 10^{-6}},\\qquad n>\\left(\\frac{10^{6}}{14400}\\right)^{1/4}\\approx 2.887.\n$$\n\n取 $n=3$。两个 $n$ 不是同一个数。$n=2$ 在这里是两大段，不是两个小区间。",
    ],
    answer: "梯形 $n=167$，Simpson $n=3$。",
  },
  {
    id: "w8",
    chapterId: "ch8",
    sectionId: "8.2.1",
    title: "例 8-2　改进 Euler 只校正一次",
    prompt:
      "$$\ny'=y-\\frac{2x}{y},\\quad y(0)=1,\\quad h=0.1,\\quad y=\\sqrt{1+2x}.\n$$\n\n用显式 Euler 和改进 Euler 各走一步，并和精确值比较。",
    steps: [
      "显式 Euler 与改进 Euler：\n\n$$\n\\begin{aligned}\ny_{n+1}&=y_n+hf(x_n,y_n),\\\\\nK_1&=f(x_n,y_n),\\quad K_2=f(x_n+h,\\,y_n+hK_1),\\\\\ny_{n+1}&=y_n+\\frac h2(K_1+K_2).\n\\end{aligned}\n$$\n\n$K$ 是斜率，里面不乘 $h$。改进 Euler 只校正一次，不是把隐式梯形解到底。",
      "显式 Euler：\n\n$$\nf(0,1)=1-0=1,\\qquad y_1=1+0.1\\times 1=1.1.\n$$",
      "改进 Euler：\n\n$$\n\\begin{aligned}\nK_1&=1,\\\\\nK_2&=f(0.1,\\,1.1)=1.1-\\frac{0.2}{1.1}=0.918182,\\\\\ny_1&=1+\\frac{0.1}{2}(1+0.918182)=1.095909.\n\\end{aligned}\n$$",
      "精确值 $\\sqrt{1.2}\\approx 1.095445$。改进 Euler 的误差约 $4.6\\times 10^{-4}$，显式 Euler 的误差约 $4.6\\times 10^{-3}$。斜率若是常数 $K$，两种格式的增量都应该是 $hK$；多出来的 $h$，就是把步长乘了两次。",
    ],
    answer: "显式 Euler 得 $1.1$，改进 Euler 得 $1.095909$，精确值约 $1.095445$。",
  },
  {
    id: "w8s",
    chapterId: "ch8s",
    sectionId: "8.5",
    title: "例 8-5　三步显式公式走一步",
    prompt:
      "三步显式 Adams 公式已经配到三阶。用 $y'=y-2x/y$，$y(0)=1$，$h=0.1$。已知四阶 R-K 起步\n\n$$\ny_0=1,\\ y_1=1.095446,\\ y_2=1.183217,\n$$\n\n对应斜率 $f_0=1$，$f_1=0.912872$，$f_2=0.845156$。预估 $y_3$，并说明系数为什么必须配成这样。",
    steps: [
      "公式是\n\n$$\ny_{n+1}=y_n+\\frac{h}{12}(23f_n-16f_{n-1}+5f_{n-2}).\n$$\n\n先检查常数解待不待得住：\n\n$$\n\\frac{23-16+5}{12}=1.\n$$\n\n$h=0$ 或 $f\\equiv 0$ 时，上式变成 $y_{n+1}=y_n$。这个 $1$ 对不上，格式连常数解都保不住。",
      "用 $n=2$ 预估下一步。前两步不是这条公式自己产生的，要先用单步法起步。\n\n$$\n\\begin{aligned}\ny_3&=1.183217+\\frac{0.1}{12}\\bigl(23\\times 0.845156-16\\times 0.912872+5\\times 1\\bigr)\\\\\n&=1.183217+\\frac{0.1}{12}\\times 9.832636\\\\\n&=1.183217+0.081939=1.265156.\n\\end{aligned}\n$$",
      "同一点的四阶 R-K 值是 $1.264912$，精确值 $\\sqrt{1.6}\\approx 1.264911$。预估和它们差在第四位小数。做有限次预测-校正，并没有把隐式公式解到底。",
    ],
    answer: "预估 $y_3=1.265156$。系数条件是 $(23-16+5)/12=1$。",
  },
  {
    id: "w9",
    chapterId: "ch9",
    sectionId: "9.1",
    title: "背景例　一个内点的五点格式",
    prompt:
      "整章不考。只把一个格子算完，用来记住符号。步长 $h=1$，唯一内点的四个邻居边值是 $1,2,3,0$，方程按 $-\\Delta u=f$，$f=4$。求内点的值。",
    steps: [
      "五点格式：\n\n$$\n4u-(u_E+u_W+u_N+u_S)=h^2 f.\n$$\n\n边界上的点直接代成已知边值，不进未知数。",
      "代入 $h=1$，$f=4$：\n\n$$\n\\begin{aligned}\n4u-(1+2+3+0)&=1\\times 4,\\\\\n4u-6&=4,\\\\\n4u&=10,\\\\\nu&=2.5.\n\\end{aligned}\n$$",
      "同一式写成“邻居平均再加源项”：\n\n$$\nu=\\frac{1+2+3+0+h^2 f}{4}=\\frac{6+4}{4}=2.5.\n$$\n\n$f=0$ 时内点等于四个邻居的平均。题目若写成 $\\Delta u=f$，右端符号相反，不要照抄这一题的 $+$。",
    ],
    answer: "内点 $u=2.5$。这一章不考，式子只用来对符号。",
  },
];
