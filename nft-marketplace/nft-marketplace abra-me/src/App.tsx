import { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import type { FormEvent } from 'react'
import {
  Search, ShoppingCart, LogIn, Menu, X, Heart, ChevronRight,
  Instagram, Linkedin, Facebook, Youtube, ArrowUpRight, ShieldCheck,
  Sparkles, Bell, Send, ChevronDown, Star, Copy, ArrowLeft, Eye, EyeOff, Mail, CheckCircle2,
  UserRound, House, MapPin, Activity, TrendingUp, FileDown, AlertCircle, LogOut, Wallet, Plus, Trash2, Camera
} from 'lucide-react'

type CartItem = {
  nft: NFT
  edition: string
  quantity: number
}

type NFT = {
  id: number
  name: string
  number: string
  price: number
  category: string
  network: string
  image: string
  badge?: string
}

const nftItems: NFT[] = [
  { id: 1, name: 'Emerald Ape', number: '#042', price: 1.19, category: 'Arte digital', network: 'Ethereum', image: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=700&q=85' },
  { id: 2, name: 'Sage Nomad', number: '#009', price: 1.69, category: 'Colecionáveis', network: 'Polygon', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=85' },
  { id: 3, name: 'Neon Vessel', number: '#552', price: 1.99, category: 'Arte 3D', network: 'Ethereum', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=700&q=85', badge: '−13%' },
  { id: 4, name: 'Purple Vision', number: '#118', price: 1.29, category: 'Fotografia', network: 'Solana', image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?auto=format&fit=crop&w=700&q=85' },
  { id: 5, name: 'Quiet Explorer', number: '#301', price: 1.39, category: 'Colecionáveis', network: 'Polygon', image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=700&q=85' },
  { id: 6, name: 'Midnight Club', number: '#076', price: 1.79, category: 'Arte digital', network: 'Ethereum', image: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=700&q=85' },
  { id: 7, name: 'Golden Beat', number: '#207', price: 0.99, category: 'Música', network: 'Solana', image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=700&q=85' },
  { id: 8, name: 'Golden Signal', number: '#160', price: 0.39, category: 'Generativa', network: 'Polygon', image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=700&q=85' },
  { id: 9, name: 'Future Relic', number: '#888', price: 2.49, category: 'Arte 3D', network: 'Ethereum', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=700&q=85' },
]

const categories = [
  ['Arte digital', 33], ['Fotografia', 12], ['Música', 65], ['Arte 3D', 39],
  ['Colecionáveis', 23], ['Generativa', 17], ['Jogos', 19], ['Assinaturas', 13], ['Utilidade', 18],
] as const

const articles = [
  { date: '13 de setembro', read: 'Leitura de 2 min', title: '10 artistas digitais para acompanhar', description: 'Conheça criadores que moldam a cultura digital.', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=700&q=85' },
  { date: '08 de setembro', read: 'Leitura de 4 min', title: 'O futuro da arte colecionável', description: 'Como a propriedade digital está transformando o colecionismo.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=85' },
  { date: '02 de setembro', read: 'Leitura de 3 min', title: 'Entenda o universo dos NFTs', description: 'Um guia direto para começar sua coleção digital.', image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?auto=format&fit=crop&w=700&q=85' },
  { date: '27 de agosto', read: 'Leitura de 5 min', title: 'Criatividade sem fronteiras', description: 'Conheça novas linguagens e possibilidades da Web3.', image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=700&q=85' },
]

function App() {
  const [activeTab, setActiveTab] = useState('Todos os NFTs')
  const [category, setCategory] = useState('Arte digital')
  const [categoryFilter, setCategoryFilter] = useState(false)
  const [network, setNetwork] = useState('Todas')
  const [minPrice, setMinPrice] = useState('0.02')
  const [maxPrice, setMaxPrice] = useState('12.30')
  const [sort, setSort] = useState('recentes')
  const [page, setPage] = useState(1)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('kurio-cart') || '[]') as CartItem[] } catch { return [] }
  })
  const [showCart, setShowCart] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [authUser, setAuthUser] = useState<{ username: string; email: string } | null>(null)
  const [dashboardTab, setDashboardTab] = useState<'profile' | 'wallets' | 'activity' | 'favorites' | 'offers' | 'downloads' | 'withdraw'>('profile')
  const [profile, setProfile] = useState(() => {
    try { return { displayName: 'Colecionador Kurio', username: 'colecionador', email: 'contato@email.com', ensSuffix: '.eth', walletNickname: 'Minha carteira', avatar: '', ...JSON.parse(localStorage.getItem('kurio-profile') || '{}') } } catch { return { displayName: 'Colecionador Kurio', username: 'colecionador', email: 'contato@email.com', ensSuffix: '.eth', walletNickname: 'Minha carteira', avatar: '' } }
  })
  const [profilePassword, setProfilePassword] = useState({ current: '', next: '', confirm: '' })
  const [profilePasswordVisible, setProfilePasswordVisible] = useState(false)
  const [profileNotice, setProfileNotice] = useState('')
  const [walletForm, setWalletForm] = useState({ displayName: '', nickname: '', network: 'rede 1', profileName: '', address: '', secondary: '', type: 'Etherium', identification: '', email: '', ens: '.eth' })
  const [secondaryWallets, setSecondaryWallets] = useState<typeof walletForm[]>(() => { try { return JSON.parse(localStorage.getItem('kurio-wallets') || '{"secondary":[]}').secondary || [] } catch { return [] } })
  const [sameWallet, setSameWallet] = useState(false)
  const [addingWallet, setAddingWallet] = useState(false)
  const [walletNotice, setWalletNotice] = useState('')
  const [purchase, setPurchase] = useState<{ id: string; date: string; total: number; wallet: string; items: CartItem[] } | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [authNotice, setAuthNotice] = useState('')
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [checkoutPromoOpen, setCheckoutPromoOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('MetaMask / WalletConnect / Coinbase')
  const [collector, setCollector] = useState({ displayName: '', username: '', profileName: '', network: 'Ethereum', walletAddress: '', secondaryWallet: '', walletType: 'Carteira A', identificationCode: '', email: '', ensName: '', useAnotherWallet: false, notes: '' })
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState('')
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const [favorites, setFavorites] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('kurio-favorites') || '[]') as number[] } catch { return [] } })
  const [email, setEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [detailImage, setDetailImage] = useState(0)
  const [edition, setEdition] = useState('1/10')
  const [quantity, setQuantity] = useState(1)
  const [detailTab, setDetailTab] = useState<'details' | 'reviews'>('details')
  const [detailNotice, setDetailNotice] = useState('')

  useEffect(() => {
    let active = true
    api<{ user: { username: string; email: string } }>('/auth/me').then(async ({ user }) => {
      if (!active) return
      setAuthUser(user)
      const [profileResult, walletResult] = await Promise.all([
        api<{ profile: typeof profile | null }>('/profile'),
        api<{ wallets: (typeof walletForm & { id: string; isPrimary: boolean })[] }>('/wallets'),
      ])
      if (!active) return
      if (profileResult.profile) setProfile(current => ({ ...current, ...profileResult.profile! }))
      const wallets = walletResult.wallets
      const primary = wallets.find(wallet => wallet.isPrimary)
      if (primary) setWalletForm(current => ({ ...current, ...primary }))
      setSecondaryWallets(wallets.filter(wallet => !wallet.isPrimary).map(({ id, isPrimary, ...wallet }) => wallet))
    }).catch(() => { if (active) setAuthUser(null) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get('oauth_error')
    if (oauthError) {
      const messages: Record<string, string> = {
        access_denied: 'A autorização foi cancelada. Você pode tentar novamente.',
        invalid_state: 'Não foi possível validar a solicitação de login. Tente novamente.',
        missing_code: 'O provedor não retornou o código de autenticação. Tente novamente.',
        provider_not_configured: 'O login social ainda não está configurado no servidor.',
        email_already_registered: 'Este e-mail já possui cadastro. Entre com seu método original para acessar a conta.',
        provider_auth_failed: 'Não foi possível concluir o login social. Verifique as configurações e tente novamente.',
      }
      setAuthNotice(messages[oauthError] || 'Falha na autenticação social. Tente novamente.')
      setLoginOpen(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (params.get('oauth') === 'success') {
      setShowDashboard(true)
      setDashboardTab('profile')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const filteredNFTs = useMemo(() => {
    let result = [...nftItems]
    if (categoryFilter) result = result.filter((item) => item.category === category)
    if (network !== 'Todas') result = result.filter((item) => item.network === network)
    result = result.filter((item) => item.price >= Number(minPrice || 0) && item.price <= Number(maxPrice || 9999))
    if (search.trim()) result = result.filter((item) => `${item.name} ${item.number} ${item.category}`.toLowerCase().includes(search.toLowerCase()))
    if (activeTab === 'Novos lançamentos') result.reverse()
    if (activeTab === 'Em alta') result.sort((a, b) => b.price - a.price)
    if (sort === 'menor-preco') result.sort((a, b) => a.price - b.price)
    if (sort === 'maior-preco') result.sort((a, b) => b.price - a.price)
    return result
  }, [activeTab, category, categoryFilter, maxPrice, minPrice, network, search, sort])

  const pageSize = 6
  const pageCount = Math.max(1, Math.ceil(filteredNFTs.length / pageSize))
  const visibleNFTs = filteredNFTs.slice((page - 1) * pageSize, page * pageSize)

  function persistCart(items: CartItem[]) {
    setCartItems(items)
    localStorage.setItem('kurio-cart', JSON.stringify(items))
  }

  function addToCart(nft: NFT, amount: number, selectedEdition: string) {
    const existing = cartItems.find((item) => item.nft.id === nft.id && item.edition === selectedEdition)
    const updated = existing
      ? cartItems.map((item) => item.nft.id === nft.id && item.edition === selectedEdition ? { ...item, quantity: Math.min(10, item.quantity + amount) } : item)
      : [...cartItems, { nft, edition: selectedEdition, quantity: amount }]
    persistCart(updated)
    setShowCart(true)
    setSelectedNFT(null)
    setDetailNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateCartQuantity(id: number, selectedEdition: string, amount: number) {
    persistCart(cartItems.map((item) => item.nft.id === id && item.edition === selectedEdition ? { ...item, quantity: Math.max(1, Math.min(10, amount)) } : item))
  }

  function applyPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = promoCode.trim().toUpperCase()
    if (code === 'KURIO10') { setPromoDiscount(10); setPromoMessage('Cupom aplicado: 10% de desconto.') }
    else if (code === 'LANCAMENTO15') { setPromoDiscount(15); setPromoMessage('Cupom aplicado: 15% de desconto.') }
    else { setPromoDiscount(0); setPromoMessage('Código inválido ou expirado.') }
  }

  function completePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!cartItems.length) return
    const total = cartItems.reduce((sum, item) => sum + item.nft.price * item.quantity, 0) * (1 - promoDiscount / 100)
    setPurchase({ id: `KUR-${Date.now().toString(36).toUpperCase()}`, date: new Date().toLocaleString('pt-BR'), total, wallet: collector.walletType, items: cartItems.map((item) => ({ ...item })) })
    persistCart([])
    setShowCheckout(false)
    setShowConfirmation(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openAuth(mode: 'login' | 'register' | 'forgot' = 'login') {
    setAuthMode(mode)
    setAuthNotice('')
    setLoginOpen(true)
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = authForm.email.trim().toLowerCase()
    try {
      if (authMode === 'forgot') {
        setAuthNotice('A recuperação de senha será habilitada quando o serviço de e-mail transacional for configurado.')
        return
      }
      if (authMode === 'register') {
        if (authForm.password !== authForm.confirmPassword) { setAuthNotice('As senhas não coincidem.'); return }
        if (authForm.password.length < 10) { setAuthNotice('A senha precisa ter pelo menos 10 caracteres.'); return }
        const result = await api<{ user: { username: string; email: string } }>('/auth/register', { method: 'POST', body: { username: authForm.username.trim(), email: normalizedEmail, password: authForm.password } })
        setAuthUser(result.user)
        setProfile(current => ({ ...current, displayName: result.user.username, username: result.user.username, email: result.user.email }))
      } else {
        const result = await api<{ user: { username: string; email: string } }>('/auth/login', { method: 'POST', body: { email: normalizedEmail, password: authForm.password } })
        setAuthUser(result.user)
        setProfile(current => ({ ...current, displayName: result.user.username, username: result.user.username, email: result.user.email }))
      }
      setShowDashboard(true); setDashboardTab('profile'); setLoginOpen(false); setAuthNotice('')
    } catch (error) { setAuthNotice(error instanceof Error ? error.message : 'Não foi possível autenticar.') }
  }

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }) } catch { /* encerra a interface mesmo se a rede estiver indisponível */ }
    setAuthUser(null)
    setShowDashboard(false)
    openAuth('login')
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      if (profilePassword.next || profilePassword.confirm || profilePassword.current) {
        if (!profilePassword.current || !profilePassword.next || !profilePassword.confirm) { setProfileNotice('Preencha os três campos de senha para alterar sua senha.'); return }
        if (profilePassword.next !== profilePassword.confirm) { setProfileNotice('A nova senha e a confirmação precisam ser idênticas.'); return }
        await api('/auth/password', { method: 'PUT', body: { currentPassword: profilePassword.current, newPassword: profilePassword.next } })
      }
      await api('/profile', { method: 'PUT', body: profile })
      setProfileNotice('Dados do perfil salvos na sua conta.')
      setProfilePassword({ current: '', next: '', confirm: '' })
    } catch (error) { setProfileNotice(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.') }
  }

  async function saveWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const result = await api<{ wallet: { id: string } }>('/wallets', { method: 'POST', body: { ...walletForm, isPrimary: !addingWallet } })
      if (addingWallet) {
        setSecondaryWallets(items => [...items, { ...walletForm }])
        setAddingWallet(false)
        setWalletForm({ displayName: '', nickname: '', network: 'rede 1', profileName: '', address: '', secondary: '', type: 'Etherium', identification: '', email: '', ens: '.eth' })
      }
      setWalletNotice(`Carteira salva na conta (ID ${result.wallet.id.slice(0, 8)}).`)
    } catch (error) { setWalletNotice(error instanceof Error ? error.message : 'Não foi possível salvar a carteira.') }
  }

  function toggleFavorite(id: number) {
    setFavorites((current) => {
      const updated = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem('kurio-favorites', JSON.stringify(updated))
      return updated
    })
  }

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterMessage('Informe um e-mail válido.')
      return
    }
    setNewsletterMessage('Inscrição registrada! Obrigado por acompanhar a Kurio.')
    setEmail('')
  }

  function openNFT(nft: NFT) {
    setSelectedNFT(nft)
    setDetailImage(0)
    setQuantity(1)
    setDetailTab('details')
    setDetailNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function shareNFT(channel: 'LinkedIn' | 'E-mail' | 'Twitter') {
    const url = window.location.href.split('#')[0] + `#nft-${selectedNFT?.id}`
    const title = `${selectedNFT?.name} ${selectedNFT?.number} — Kurio`
    const links = {
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      'E-mail': `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    }
    window.open(links[channel], '_blank', 'noopener,noreferrer')
  }

  function changeCategory(value: string) {
    setCategory(value)
    setCategoryFilter(true)
    setPage(1)
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" onClick={(event) => { if (selectedNFT || showCart || showCheckout || showConfirmation || showDashboard) { event.preventDefault(); setShowDashboard(false); setSelectedNFT(null); setShowCart(false); setShowCheckout(false); setShowConfirmation(false); window.scrollTo({ top: 0, behavior: 'smooth' }) } }} aria-label="Kurio, página inicial">KURIO</a>
        <label className="mobile-search" aria-label="Explorar coleções"><Search size={19} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Explorar coleções" /></label>
        <button className="mobile-menu-toggle icon-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
        <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Navegação principal">
          <a className={`nav-link ${!selectedNFT ? 'active' : ''}`} href="#inicio" onClick={(event) => { setMobileMenuOpen(false); if (selectedNFT || showCart || showCheckout || showConfirmation || showDashboard) { event.preventDefault(); setShowDashboard(false); setSelectedNFT(null); setShowCart(false); setShowCheckout(false); setShowConfirmation(false); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}>Início</a>
          <a className="nav-link" href="#mercado" onClick={(event) => { setMobileMenuOpen(false); if (selectedNFT || showCart || showCheckout || showConfirmation || showDashboard) { event.preventDefault(); setShowDashboard(false); setSelectedNFT(null); setShowCart(false); setShowCheckout(false); setShowConfirmation(false); setTimeout(() => document.getElementById('mercado')?.scrollIntoView({ behavior: 'smooth' }), 0) } }}>Mercado</a>
          <a className="nav-link" href="#criadores" onClick={() => setMobileMenuOpen(false)}>Criadores</a>
          <a className="nav-link" href="#diario" onClick={() => setMobileMenuOpen(false)}>Aprenda</a>
        </nav>
        <div className="top-actions">
          {searchOpen && <input className="nav-search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar NFTs..." aria-label="Buscar NFTs" autoFocus />}
          <button className="icon-button" aria-label="Pesquisar NFTs" onClick={() => setSearchOpen(!searchOpen)}><Search size={23} /></button>
          <button className="icon-button cart-button" aria-label={`Carrinho com ${cartCount} itens`} onClick={() => { setShowCart(true); setShowCheckout(false); setSelectedNFT(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <ShoppingCart size={23} /><span className="cart-count">{cartCount}</span>
          </button>
          <button className="login-button" onClick={() => { if (authUser) { setShowDashboard(true); setShowCart(false); setShowCheckout(false); setShowConfirmation(false); setSelectedNFT(null); window.scrollTo({ top: 0, behavior: 'smooth' }) } else { openAuth('login') } }}><UserRound size={18} /> {authUser ? 'Meu perfil' : 'Entrar'}</button>
        </div>
      </header>

      <main>
        {showDashboard && authUser ? (
          <section className="dashboard-page">
            <div className="dashboard-layout">
              <aside className="dashboard-sidebar"><h1>Meu perfil</h1>
                {[['profile','Dados do perfil',UserRound],['wallets','Carteiras',MapPin],['activity','Atividade',ShoppingCart],['favorites','Lista de interesse',Heart],['offers','Ofertas',TrendingUp],['downloads','Arquivos baixados',FileDown],['withdraw','Saque',AlertCircle]].map(([key,label,Icon]) => { const I = Icon as typeof UserRound; return <button key={key as string} className={dashboardTab === key ? 'active' : ''} onClick={() => { setDashboardTab(key as typeof dashboardTab); setAddingWallet(false); setWalletNotice(''); setProfileNotice('') }}><I size={18}/>{label as string}</button> })}
                <button className="dashboard-logout" onClick={logout}><LogOut size={18}/>Sair</button>
              </aside>
              <div className="dashboard-content">
                {dashboardTab === 'profile' ? <section className="dashboard-panel"><h2>Perfil do colecionador</h2><form onSubmit={saveProfile}>
                  <div className="dashboard-form-grid">
                    <label>Nome de exibição<input required value={profile.displayName} onChange={e=>setProfile({...profile,displayName:e.target.value})}/></label>
                    <label>Nome de usuário<input required value={profile.username} onChange={e=>setProfile({...profile,username:e.target.value})}/></label>
                    <label>E-mail<input required type="email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label>
                    <label>Nome ENS<select value={profile.ensSuffix} onChange={e=>setProfile({...profile,ensSuffix:e.target.value})}><option>.eth</option><option>.coin</option><option>.master</option></select></label>
                    <label>Apelido de carteira<input required value={profile.walletNickname} onChange={e=>setProfile({...profile,walletNickname:e.target.value})}/></label>
                    <div className="avatar-field"><span>Avatar</span><div className="avatar-controls">{profile.avatar ? <img src={profile.avatar} alt="Avatar do usuário"/> : <div className="avatar-placeholder"><UserRound/></div>}<label className="avatar-upload">Alterar<input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0]; if(file) setProfile({...profile,avatar:URL.createObjectURL(file)})}}/></label><button type="button" className="avatar-remove" onClick={()=>setProfile({...profile,avatar:''})}>Remover</button></div></div>
                  </div>
                  <h3 className="password-section-title">Alterar senha</h3><div className="dashboard-form-grid password-grid">
                    {([['current','Senha atual'],['next','Nova senha'],['confirm','Confirmar nova senha']] as const).map(([key,label])=><label key={key}>{label}<div className="dashboard-password"><input type={profilePasswordVisible?'text':'password'} value={profilePassword[key]} onChange={e=>setProfilePassword({...profilePassword,[key]:e.target.value})} placeholder="••••••••"/><button type="button" onClick={()=>setProfilePasswordVisible(!profilePasswordVisible)} aria-label="Mostrar ou ocultar senha">{profilePasswordVisible?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>)}
                  </div><button className="dashboard-save" type="submit">Salvar</button>{profileNotice && <p className="dashboard-notice">{profileNotice}</p>}
                </form></section> : dashboardTab === 'wallets' ? <section className="dashboard-panel"><h2>{addingWallet ? 'Adicionar carteira' : 'Carteira principal'}</h2><p className="dashboard-help">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p><form onSubmit={saveWallet}><div className="dashboard-form-grid">
                  <label>Nome de exibição<input required value={walletForm.displayName} onChange={e=>setWalletForm({...walletForm,displayName:e.target.value})}/></label><label>Apelido da carteira<input required value={walletForm.nickname} onChange={e=>setWalletForm({...walletForm,nickname:e.target.value})}/></label>
                  <label>Rede<select required value={walletForm.network} onChange={e=>setWalletForm({...walletForm,network:e.target.value})}><option>rede 1</option><option>rede 2</option><option>rede 3</option></select></label><label>Nome do perfil<input required value={walletForm.profileName} onChange={e=>setWalletForm({...walletForm,profileName:e.target.value})}/></label>
                  <label>Endereço de carteira<input required value={walletForm.address} onChange={e=>setWalletForm({...walletForm,address:e.target.value})} placeholder="Endereço 0x de carteira"/></label><label>ENS ou carteira secundária (opcional)<input value={walletForm.secondary} onChange={e=>setWalletForm({...walletForm,secondary:e.target.value})} placeholder="ENS ou endereço secundário"/></label>
                  <label>Tipo de carteira<select required value={walletForm.type} onChange={e=>setWalletForm({...walletForm,type:e.target.value})}><option>Etherium</option><option>Bitcoin</option><option>Master</option></select></label><label>Código de identificação<input required value={walletForm.identification} onChange={e=>setWalletForm({...walletForm,identification:e.target.value})}/></label>
                  <label>E-mail<input required type="email" value={walletForm.email} onChange={e=>setWalletForm({...walletForm,email:e.target.value})}/></label><label>Nome ENS<select required value={walletForm.ens} onChange={e=>setWalletForm({...walletForm,ens:e.target.value})}><option>.eth</option><option>.coin</option><option>.master</option></select></label>
                </div><button className="dashboard-save" type="submit">Salvar carteira</button>{walletNotice && <p className="dashboard-notice">{walletNotice}</p>}</form>
                {!addingWallet && <div className="secondary-wallet-heading"><h3>Carteira secundária</h3><label><input type="checkbox" checked={sameWallet} onChange={e=>setSameWallet(e.target.checked)}/> Igual à carteira principal</label><button onClick={()=>{setAddingWallet(true);setWalletNotice('')}}><Plus size={16}/>Adicionar</button></div>}
                {!addingWallet && secondaryWallets.length===0 && <p className="dashboard-help secondary-empty">Você ainda não adicionou uma carteira secundária.</p>}
                {secondaryWallets.map((wallet,index)=><div className="saved-wallet" key={`${wallet.address}-${index}`}><Wallet size={18}/><div><strong>{wallet.nickname}</strong><small>{wallet.address} · {wallet.network}</small></div><button onClick={async()=>{try{const data=await api<{wallets:(typeof walletForm & {id:string;isPrimary:boolean})[]}>('/wallets');const saved=data.wallets.filter(item=>!item.isPrimary)[index];if(saved) await api(`/wallets/${saved.id}`,{method:'DELETE'});setSecondaryWallets(items=>items.filter((_,i)=>i!==index))}catch(error){setWalletNotice(error instanceof Error?error.message:'Falha ao remover carteira.')}}} aria-label="Remover carteira"><Trash2 size={16}/></button></div>)}
                {addingWallet && <button className="wallet-cancel" onClick={()=>setAddingWallet(false)}>Cancelar adição</button>}
              </section> : <section className="dashboard-panel dashboard-placeholder"><h2>{({activity:'Atividade',favorites:'Lista de interesse',offers:'Ofertas',downloads:'Arquivos baixados',withdraw:'Saque'} as Record<string,string>)[dashboardTab]}</h2><p>{dashboardTab==='favorites' ? 'Seus NFTs favoritos aparecerão aqui.' : dashboardTab==='activity' ? 'Seu histórico de compras e movimentações aparecerá aqui.' : dashboardTab==='offers' ? 'As ofertas recebidas e enviadas aparecerão aqui.' : dashboardTab==='downloads' ? 'Os arquivos disponíveis para download aparecerão aqui.' : 'As opções de saque serão exibidas aqui quando houver saldo disponível.'}</p>{dashboardTab==='favorites' && favorites.length>0 && <div className="dashboard-favorites">{nftItems.filter(item=>favorites.includes(item.id)).map(item=><article key={item.id}><img src={item.image} alt={item.name}/><strong>{item.name}</strong></article>)}</div>}</section>}
              </div>
            </div>
          </section>
        ) : showConfirmation && purchase ? (
          <section className="confirmation-page">
            <div className="confirmation-card">
              <div className="thank-envelope" aria-hidden="true"><Mail size={54}/><span>Thank you</span></div>
              <h1>Seus NFTs agora estão na sua carteira</h1>
              <div className="transaction-metadata">
                <div><span>ID da transação</span><strong>{purchase.id}</strong></div>
                <div><span>Data</span><strong>{purchase.date}</strong></div>
                <div><span>Total</span><strong>{purchase.total.toFixed(2)} ETH</strong></div>
                <div><span>Carteira</span><strong>{purchase.wallet}</strong></div>
              </div>
              <h2>Detalhes da transação</h2>
              <div className="confirmation-items">
                {purchase.items.map((item) => <article className="confirmation-item" key={`${item.nft.id}-${item.edition}`}><img src={item.nft.image} alt={item.nft.name}/><div className="confirmation-item-name"><strong>{item.nft.name} {item.nft.number}</strong><small>ID do token #{String(item.nft.id).padStart(6,'0')}{item.nft.number.replace('#','')}</small></div><span>Qtd. {item.quantity}</span><strong>{(item.nft.price * item.quantity).toFixed(2)} ETH</strong></article>)}
              </div>
              <div className="confirmation-total"><span>Total</span><strong>{purchase.total.toFixed(2)} ETH</strong></div>
              <div className="transaction-status"><CheckCircle2 size={21}/><div><strong>Transação confirmada na Ethereum.</strong><p>A propriedade foi transferida para a sua carteira conectada e registrada na rede. <small>Confirmação demonstrativa: nenhuma operação real foi enviada à blockchain.</small></p></div></div>
              <button className="cart-primary etherscan-button" onClick={() => { setShowConfirmation(false); setSelectedNFT(null); setShowCart(false); setShowCheckout(false); openAuth('login'); window.scrollTo({top:0,behavior:'smooth'}) }}>Ver no EtherScan</button>
            </div>
          </section>
        ) : showCheckout ? (
          <div className="checkout-page">
            <div className="detail-breadcrumb"><button onClick={() => setShowCart(true)}><ArrowLeft size={15}/> Voltar ao carrinho</button><span>Início / Carrinho / Perfil do colecionador</span></div>
            <form className="checkout-layout" onSubmit={completePurchase}>
              <section className="collector-form"><h1>Perfil do colecionador</h1><div className="form-grid">
                <label>Nome de exibição <em>*</em><input required value={collector.displayName} onChange={e=>setCollector({...collector,displayName:e.target.value})} placeholder="Como deseja ser identificado"/></label>
                <label>Nome do usuário <em>*</em><input required value={collector.username} onChange={e=>setCollector({...collector,username:e.target.value})} placeholder="Seu nome de usuário"/></label>
                <label>Nome do perfil<input value={collector.profileName} onChange={e=>setCollector({...collector,profileName:e.target.value})} placeholder="Nome do perfil"/></label>
                <label>Rede <em>*</em><select required value={collector.network} onChange={e=>setCollector({...collector,network:e.target.value})}><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label>
                <label className="wide-field">Endereço de carteira <em>*</em><input required pattern="0x[a-fA-F0-9]{40}" value={collector.walletAddress} onChange={e=>setCollector({...collector,walletAddress:e.target.value})} placeholder="Endereço 0x da carteira"/></label>
                <label className="wide-field">ENS ou carteira secundária (opcional)<input value={collector.secondaryWallet} onChange={e=>setCollector({...collector,secondaryWallet:e.target.value})} placeholder="nome.eth ou endereço secundário"/></label>
                <label>Tipo de carteira <em>*</em><select required value={collector.walletType} onChange={e=>setCollector({...collector,walletType:e.target.value})}><option>Carteira A</option><option>Carteira B</option><option>Carteira C</option></select></label>
                <label>Código de identificação<input value={collector.identificationCode} onChange={e=>setCollector({...collector,identificationCode:e.target.value})} placeholder="Código de identificação"/></label>
                <label>Email <em>*</em><input required type="email" value={collector.email} onChange={e=>setCollector({...collector,email:e.target.value})} placeholder="voce@email.com"/></label>
                <label>Nome ENS <em>*</em><input required value={collector.ensName} onChange={e=>setCollector({...collector,ensName:e.target.value})} placeholder="nome.eth"/></label>
                <label className="wide-field checkbox-field"><input type="checkbox" checked={collector.useAnotherWallet} onChange={e=>setCollector({...collector,useAnotherWallet:e.target.checked})}/> Usar outra carteira</label>
                {collector.useAnotherWallet && <label className="wide-field">Endereço da outra carteira<input placeholder="0x..."/></label>}
                <label className="wide-field">Observação do colecionador (opcional)<textarea rows={3} value={collector.notes} onChange={e=>setCollector({...collector,notes:e.target.value})} placeholder="Adicione uma observação"/></label>
              </div></section>
              <aside className="checkout-summary"><h2>Seus NFTs</h2>{cartItems.map(item=><article className="checkout-item" key={`${item.nft.id}-${item.edition}`}><img src={item.nft.image} alt={item.nft.name}/><div><strong>{item.nft.name} {item.nft.number}</strong><small>ID do token #{String(item.nft.id).padStart(6,'0')}{item.nft.number.replace('#','')}</small><small>Quantidade: {item.quantity}</small></div><b>{(item.nft.price*item.quantity).toFixed(2)} ETH</b></article>)}
                <button type="button" className="promo-link" onClick={()=>setCheckoutPromoOpen(!checkoutPromoOpen)}>Tem um código promocional? <u>Aplique aqui</u></button>
                {checkoutPromoOpen && <div className="promo-form checkout-promo"><label htmlFor="checkout-promo-code">Código promocional</label><div><input id="checkout-promo-code" value={promoCode} onChange={e=>setPromoCode(e.target.value)} placeholder="Digite seu código"/><button type="button" onClick={()=>applyPromo({ preventDefault: () => undefined } as FormEvent<HTMLFormElement>)}>Aplicar</button></div>{promoMessage && <p className="promo-message">{promoMessage}</p>}</div>}
                <div className="summary-total"><span>Subtotal com desconto</span><strong>{(cartItems.reduce((sum,item)=>sum+item.nft.price*item.quantity,0)*(1-promoDiscount/100)).toFixed(2)} ETH</strong></div>
                <h3 className="payment-heading">Forma de pagamento</h3><div className="payment-options">{['MetaMask / WalletConnect / Coinbase','MetaMask','Coinbase Wallet'].map(method=><label key={method} className={paymentMethod===method?'selected':''}><input type="radio" name="payment" value={method} checked={paymentMethod===method} onChange={()=>setPaymentMethod(method)}/><span>{method}</span></label>)}</div>
                <button className="cart-primary" type="submit">Confirmar compra</button><p className="cart-disclaimer">A compra será processada em ambiente de simulação. Nenhuma transação real será enviada à blockchain.</p>
              </aside>
            </form>
          </div>
        ) : showFavorites ? (
          <section className="favorites-page"><div className="favorites-heading"><button onClick={() => setShowFavorites(false)}><ArrowLeft size={16}/> Voltar</button><h1>Minha lista de favoritos</h1><p>Obras que você selecionou para acompanhar.</p></div><div className="nft-grid">{nftItems.filter(item => favorites.includes(item.id)).map(nft => <article className="nft-card" key={nft.id} onClick={() => { setShowFavorites(false); openNFT(nft) }}><div className="nft-image-wrap"><img src={nft.image} alt={nft.name}/><button className="favorite-button is-favorite" onClick={event => { event.stopPropagation(); toggleFavorite(nft.id) }} aria-label="Remover dos favoritos"><Heart size={18} fill="currentColor"/></button></div><div className="nft-info"><p className="nft-name">{nft.name} <span>{nft.number}</span></p><div className="nft-bottom"><strong>{nft.price.toFixed(2)} ETH</strong><button onClick={event => { event.stopPropagation(); addToCart(nft, 1, '1/10') }}>Adicionar <span>+</span></button></div></div></article>)}{favorites.length === 0 && <p className="empty-state">Você ainda não adicionou NFTs aos favoritos.</p>}</div></section>
        ) : showCart ? (
          <div className="cart-page">
            <div className="detail-breadcrumb"><button onClick={() => { setShowCart(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><ArrowLeft size={15} /> Continuar explorando</button><span>Início / Carrinho</span></div>
            <h1 className="cart-title">Meu carrinho <span>({cartCount} {cartCount === 1 ? 'item' : 'itens'})</span></h1>
            {cartItems.length === 0 ? <div className="cart-empty"><ShoppingCart size={38}/><h2>Seu carrinho está vazio</h2><p>Explore o mercado e encontre NFTs para sua coleção.</p><button className="cart-primary" onClick={() => setShowCart(false)}>Explorar NFTs</button></div> : <>
              <div className="cart-layout">
                <section className="cart-table-wrap" aria-label="Itens do carrinho">
                  <div className="cart-table-head"><span>NFTs</span><span>Preço</span><span>Edições</span><span>Total</span><span aria-label="Ações"></span></div>
                  {cartItems.map((item) => <article className="cart-row" key={`${item.nft.id}-${item.edition}`}>
                    <div className="cart-product"><img src={item.nft.image} alt={item.nft.name}/><div><strong>{item.nft.name} {item.nft.number}</strong><small>Token #{String(item.nft.id).padStart(6,'0')}{item.nft.number.replace('#','')}</small><small>Edição {item.edition}</small></div></div>
                    <div className="cart-cell" data-label="Preço">{item.nft.price.toFixed(2)} ETH</div>
                    <div className="cart-cell" data-label="Edições"><div className="quantity-control cart-quantity"><button onClick={() => updateCartQuantity(item.nft.id,item.edition,item.quantity-1)} aria-label={`Diminuir ${item.nft.name}`}>−</button><output>{item.quantity}</output><button onClick={() => updateCartQuantity(item.nft.id,item.edition,item.quantity+1)} aria-label={`Aumentar ${item.nft.name}`}>+</button></div></div>
                    <div className="cart-cell cart-line-total" data-label="Total">{(item.nft.price * item.quantity).toFixed(2)} ETH</div>
                    <button className="remove-cart-item" onClick={() => persistCart(cartItems.filter((current) => !(current.nft.id === item.nft.id && current.edition === item.edition)))} aria-label={`Remover ${item.nft.name} do carrinho`}><X size={17}/></button>
                  </article>)}
                </section>
                <aside className="cart-summary"><h2>Resumo da carteira</h2><form className="promo-form" onSubmit={applyPromo}><label htmlFor="promo-code">Código promocional</label><div><input id="promo-code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Digite o código promocional"/><button type="submit">Aplicar</button></div></form>{promoMessage && <p className={`promo-message ${promoDiscount ? 'success' : ''}`} role="status">{promoMessage}</p>}<div className="summary-line"><span>Subtotal</span><strong>{cartItems.reduce((sum,item) => sum + item.nft.price * item.quantity,0).toFixed(2)} ETH</strong></div><div className="summary-line"><span>Desconto do lançamento</span><strong>{(cartItems.reduce((sum,item) => sum + item.nft.price * item.quantity,0) * promoDiscount / 100).toFixed(2)} ETH</strong></div><div className="summary-total"><span>Total</span><strong>{(cartItems.reduce((sum,item) => sum + item.nft.price * item.quantity,0) * (1-promoDiscount/100)).toFixed(2)} ETH</strong></div><button className="cart-primary" onClick={() => { setShowCheckout(true); setShowCart(false); window.scrollTo({top:0,behavior:'smooth'}) }}>Conectar e finalizar</button><button className="cart-secondary" onClick={() => setShowCart(false)}>Continuar explorando</button><p className="cart-disclaimer">As taxas de rede serão calculadas na etapa de confirmação.</p></aside>
              </div>
            </>}
            <section className="cart-viewers"><h2>Colecionadores também viram</h2><div>{[{name:'Marina',img:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop'},{name:'Lucas',img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop'},{name:'Camila',img:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop'},{name:'Rafael',img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop'}].map(person => <article key={person.name}><img src={person.img} alt={person.name}/><span>{person.name}</span></article>)}</div></section>
          </div>
        ) : selectedNFT ? (
          <div className="nft-detail-page">
            <div className="detail-breadcrumb"><button onClick={() => { setSelectedNFT(null); setShowCart(false) }}><ArrowLeft size={15} /> Voltar ao mercado</button><span>Mercado / {selectedNFT.name}</span></div>
            <section className="product-overview">
              <div className="product-gallery">
                <div className="gallery-thumbnails" aria-label="Imagens do NFT">
                  {[0, 1, 2, 3].map((index) => <button key={index} className={detailImage === index ? 'selected' : ''} onClick={() => setDetailImage(index)} aria-label={`Ver imagem ${index + 1}`}><img className={`angle-${index}`} src={selectedNFT.image} alt={`${selectedNFT.name}, ângulo ${index + 1}`} /></button>)}
                </div>
                <div className="gallery-main"><img className={`angle-${detailImage}`} src={selectedNFT.image} alt={`${selectedNFT.name}, imagem ampliada`} /></div>
              </div>
              <div className="product-information">
                <p className="product-collection-label">KURIO EDITIONS · {selectedNFT.network.toUpperCase()}</p>
                <h1>{selectedNFT.name} <span>{selectedNFT.number}</span></h1>
                <div className="product-rating"><span className="rating-stars" aria-label="5 de 5 estrelas">{[1,2,3,4,5].map((star) => <Star key={star} size={15} fill="currentColor" />)}</span><span>4,9 (28 avaliações)</span><i /> <strong>{selectedNFT.price.toFixed(2)} ETH</strong></div>
                <div className="product-divider" />
                <h2>Sobre este NFT:</h2>
                <p className="product-description">Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.</p>
                <div className="edition-block"><h3>Edição:</h3><div className="edition-options">{['1/1', '1/10', '1/50'].map((item) => <button key={item} className={edition === item ? 'chosen' : ''} onClick={() => setEdition(item)}>{item}</button>)}<span className="edition-status">Aberta</span></div></div>
                <div className="purchase-row"><div className="quantity-control"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Diminuir quantidade">−</button><output aria-live="polite">{quantity}</output><button onClick={() => setQuantity((value) => Math.min(10, value + 1))} aria-label="Aumentar quantidade">+</button></div><button className="buy-button" onClick={() => addToCart(selectedNFT, quantity, edition)}>Comprar</button><button className={`detail-favorite ${favorites.includes(selectedNFT.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(selectedNFT.id)}><Heart size={17} fill={favorites.includes(selectedNFT.id) ? 'currentColor' : 'none'} /> Favoritar</button></div>
                {detailNotice && <p className="detail-notice" role="status">{detailNotice}</p>}
                <div className="token-line"><span>ID do token:</span><strong>#{String(selectedNFT.id).padStart(6, '0')}{selectedNFT.number.replace('#','')}</strong></div>
                <div className="token-line"><span>Coleção:</span><strong>Kurio Editions</strong></div>
                <div className="share-row"><span>Compartilhar:</span><button onClick={() => shareNFT('LinkedIn')}>LinkedIn</button><button onClick={() => shareNFT('E-mail')}>E-mail</button><button onClick={() => shareNFT('Twitter')}>Twitter</button><button aria-label="Copiar link" onClick={() => { navigator.clipboard?.writeText(window.location.href.split('#')[0] + `#nft-${selectedNFT.id}`); setDetailNotice('Link copiado para compartilhar.') }}><Copy size={14} /></button></div>
              </div>
            </section>
            <section className="product-extra">
              <div className="detail-tabs" role="tablist" aria-label="Informações do NFT"><button className={detailTab === 'details' ? 'active' : ''} onClick={() => setDetailTab('details')} role="tab" aria-selected={detailTab === 'details'}>Detalhes do NFT</button><button className={detailTab === 'reviews' ? 'active' : ''} onClick={() => setDetailTab('reviews')} role="tab" aria-selected={detailTab === 'reviews'}>Avaliações dos colecionadores (28)</button></div>
              {detailTab === 'details' ? <div className="detail-description"><h3>{selectedNFT.name} {selectedNFT.number}</h3><p>A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrado na rede. Nova Sato recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.</p><dl><div><dt>Rede:</dt><dd>Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.</dd></div><div><dt>Contrato:</dt><dd>Direitos autorais do criador: 5% nas vendas secundárias, pago automaticamente pelos mercados compatíveis.</dd></div><div><dt>Direitos autorais:</dt><dd>0x7A42...19E8 · Contrato inteligente ERC-721 verificado.</dd></div></dl></div> : <div className="review-list">{[{name:'Marina Costa', stars:5, text:'Arte muito bem finalizada. A qualidade dos detalhes é excelente.'},{name:'Rafael Mendes', stars:5, text:'Uma peça especial para a coleção. Processo de compra simples.'},{name:'Luiza Ferreira', stars:4, text:'Gostei bastante da edição e da proposta artística.'}].map((review) => <article className="review-card" key={review.name}><div><strong>{review.name}</strong><span className="rating-stars">{Array.from({length:review.stars}, (_, index) => <Star key={index} size={13} fill="currentColor" />)}</span></div><p>{review.text}</p></article>)}</div>}
            </section>
            <section className="more-collection"><h2>Mais desta coleção</h2><div className="related-grid">{nftItems.filter((item) => item.id !== selectedNFT.id).slice(0,5).map((item) => <button className="related-card" key={item.id} onClick={() => openNFT(item)}><img src={item.image} alt={item.name} loading="lazy"/><strong>{item.name} {item.number}</strong><span>{item.price.toFixed(2)} ETH</span></button>)}</div></section>
          </div>
        ) : (
        <>
        <section className="hero" id="inicio">
          <div className="mobile-hero-art"><img src="https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=700&q=85" alt="Arte digital em destaque" /></div>
          <div className="hero-copy">
            <h1 className="mobile-hero-title">SEJA DONO DA CULTURA DIGITAL</h1>
            <p className="eyebrow">Bem-vindo à Kurio</p>
            <h1>SEJA DONO DO FUTURO<br />DA ARTE DIGITAL</h1>
            <p className="hero-description">Descubra NFTs selecionadas de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</p>
            <a className="primary-button" href="#mercado">EXPLORAR</a>
            <div className="hero-dots" aria-label="Slide 1 de 3"><span /><span /><span /></div>
          </div>
          <div className="hero-art">
            <img src="https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1000&q=90" alt="Obra de arte digital em destaque" />
          </div>
        </section>

        <section className="market-section" id="mercado">
          <aside className="filters-panel">
            <h2>Coleções</h2>
            <div className="category-list">
              {categories.map(([name, count]) => (
                <button key={name} className={`filter-link ${categoryFilter && category === name ? 'selected' : ''}`} onClick={() => changeCategory(name)}>
                  <span>{name}</span><span>({count})</span>
                </button>
              ))}
              <button className="clear-filter" onClick={() => { setCategoryFilter(false); setCategory('Arte digital'); setPage(1) }}>Limpar categoria</button>
            </div>
            <div className="filter-group">
              <h3>Faixa de preço</h3>
              <div className="price-inputs">
                <label>De <input type="number" min="0" step="0.01" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1) }} /></label>
                <label>Até <input type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }} /></label>
              </div>
              <p className="price-caption">Preço: {Number(minPrice || 0).toFixed(2).replace('.', ',')} – {Number(maxPrice || 0).toFixed(2).replace('.', ',')} ETH</p>
            </div>
            <div className="filter-group">
              <h3>Rede</h3>
              {['Ethereum', 'Polygon', 'Solana'].map((item, index) => (
                <button key={item} className={`filter-link ${network === item ? 'selected' : ''}`} onClick={() => { setNetwork(network === item ? 'Todas' : item); setPage(1) }}>
                  <span>{item}</span><span>({[119, 78, 86][index]})</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="market-content">
            <div className="market-toolbar">
              <div className="tabs" role="tablist" aria-label="Listagem de NFTs">
                {['Todos os NFTs', 'Novos lançamentos', 'Em alta'].map((tab) => (
                  <button key={tab} role="tab" aria-selected={activeTab === tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setPage(1) }}>{tab}</button>
                ))}
              </div>
              <label className="sort-control">Ordenar por:
                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}>
                  <option value="recentes">Listados recentemente</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="maior-preco">Maior preço</option>
                </select>
                <ChevronDown size={15} />
              </label>
            </div>
            <div className="nft-grid">
              {visibleNFTs.map((nft) => (
                <article className="nft-card" key={nft.id} onClick={() => openNFT(nft)} tabIndex={0} role="link" onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openNFT(nft) } }}>
                  <div className="nft-image-wrap">
                    <img src={nft.image} alt={`${nft.name}, item ${nft.number}`} loading="lazy" />
                    {nft.badge && <span className="nft-badge">{nft.badge}</span>}
                    <button className={`favorite-button ${favorites.includes(nft.id) ? 'is-favorite' : ''}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(nft.id) }} aria-label={favorites.includes(nft.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
                      <Heart size={18} fill={favorites.includes(nft.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="nft-info">
                    <p className="nft-name">{nft.name} <span>{nft.number}</span></p>
                    <div className="nft-bottom"><strong>{nft.price.toFixed(2)} ETH</strong><button onClick={(event) => { event.stopPropagation(); addToCart(nft, 1, '1/10') }}>Adicionar <span>+</span></button></div>
                  </div>
                </article>
              ))}
              {visibleNFTs.length === 0 && <p className="empty-state">Nenhum NFT encontrado com esses filtros.</p>}
            </div>
            <div className="pagination" aria-label="Paginação">
              <span className="page-status">Página {page} de {pageCount}</span>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Página anterior">‹</button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? 'current' : ''} onClick={() => setPage(number)}>{number}</button>)}
              <button disabled={page === pageCount} onClick={() => setPage(page + 1)} aria-label="Próxima página"><ChevronRight size={17} /></button>
            </div>
          </div>
        </section>

        <section className="featured-strip" id="criadores">
          <div className="featured-image"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=85" alt="NFT em destaque" /></div>
          <div className="featured-copy">
            <p className="section-kicker">NFT EM DESTAQUE</p>
            <h2>Oferta limitada</h2>
            <p>Uma peça especial para colecionadores que valorizam a arte digital.</p>
            <a href="#mercado" className="outline-button">Explorar coleção <ArrowUpRight size={16} /></a>
          </div>
          <div className="featured-small"><Sparkles size={28} /><span>Curadoria Kurio</span><strong>Arte que atravessa o digital.</strong></div>
        </section>

        <section className="editorial-callout">
          <div className="editorial-thumb"><img src="https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?auto=format&fit=crop&w=600&q=85" alt="Arte digital de edição limitada" /></div>
          <div className="editorial-copy">
            <h2>Lançamentos de gênesis de edição limitada</h2>
            <p>Colecione edições escassas diretamente dos criadores de revelação pura.</p>
            <a className="primary-button" href="#mercado">EXPLORAR</a>
          </div>
        </section>

        <section className="journal-section" id="diario">
          <div className="section-heading">
            <h2>Diário da Cunhagem</h2>
            <p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
          </div>
          <div className="article-grid">
            {articles.map((article) => (
              <article className="article-card" key={article.title}>
                <a className="article-image" href="#diario" aria-label={`Ler ${article.title}`}><img src={article.image} alt="" loading="lazy" /></a>
                <p className="article-meta">{article.date} <span>|</span> {article.read}</p>
                <h3>{article.title}</h3>
                <p className="article-description">{article.description}</p>
                <a className="read-more" href="#diario">Ler mais...</a>
              </article>
            ))}
          </div>
        </section>

        <section className="benefits-newsletter">
          <div className="benefit">
            <ShieldCheck className="benefit-icon" />
            <h3>Segurança da carteira</h3>
            <p>Proteja sua carteira e colecione arte digital verificada com confiança.</p>
          </div>
          <div className="benefit">
            <Sparkles className="benefit-icon" />
            <h3>Criadores em destaque</h3>
            <p>Conheça artistas, estúdios e comunidades que moldam a cultura digital da rede.</p>
          </div>
          <div className="benefit">
            <Bell className="benefit-icon" />
            <h3>Alertas de lançamentos</h3>
            <p>Receba calendários de cunhagem, novidades de listas de acesso e análise de mercado.</p>
          </div>
          <div className="newsletter">
            <h3>Antecipe-se ao próximo lançamento</h3>
            <form onSubmit={subscribe}>
              <label className="sr-only" htmlFor="newsletter-email">Seu e-mail</label>
              <input id="newsletter-email" type="email" placeholder="Digite seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" aria-label="Enviar e-mail"><Send size={17} /> Enviar</button>
            </form>
            {newsletterMessage && <p className="newsletter-message" role="status">{newsletterMessage}</p>}
          </div>
        </section>
        </>
        )}
      </main>

      {loginOpen && <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLoginOpen(false) }}>
        <section className="auth-modal" role="dialog" aria-modal="true" aria-label="Acesso à Kurio">
          <button className="auth-close" onClick={() => setLoginOpen(false)} aria-label="Fechar"><X size={21}/></button>
          <div className="auth-tabs"><button className={authMode === 'login' || authMode === 'forgot' ? 'active' : ''} onClick={() => openAuth('login')}>Entrar</button><button className={authMode === 'register' ? 'active' : ''} onClick={() => openAuth('register')}>Criar conta</button></div>
          <p className="auth-intro">{authMode === 'login' ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.' : authMode === 'register' ? 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.' : 'Informe seu e-mail para receber instruções de recuperação de acesso.'}</p>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && <label>Nome do usuário<input required value={authForm.username} onChange={e=>setAuthForm({...authForm,username:e.target.value})} placeholder="Nome do usuário"/></label>}
            <label>{authMode === 'register' ? 'E-mail' : 'E-mail'}<input required type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="contato@email.com"/></label>
            {authMode !== 'forgot' && <label>Senha<div className="password-field"><input required type={showPassword ? 'text' : 'password'} value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder="Digite sua senha"/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>}
            {authMode === 'register' && <label>Confirmar senha<input required type={showPassword ? 'text' : 'password'} value={authForm.confirmPassword} onChange={e=>setAuthForm({...authForm,confirmPassword:e.target.value})} placeholder="Confirme sua senha"/></label>}
            {authMode === 'login' && <button type="button" className="forgot-link" onClick={()=>openAuth('forgot')}>Esqueceu a senha?</button>}
            <button type="submit" className="auth-submit">{authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Criar conta' : 'Enviar instruções'}</button>
          </form>
          {authNotice && <p className="auth-notice" role="status">{authNotice}</p>}
          {authMode !== 'forgot' && <><div className="auth-divider"><span>Ou continue com</span></div><button type="button" className="social-auth" onClick={() => { window.location.assign(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/google`) }}><b className="google-mark">G</b>Continuar com o Google</button><button type="button" className="social-auth" onClick={() => { window.location.assign(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/facebook`) }}><Facebook size={18}/>Continuar com Facebook</button></>}
          {authMode === 'forgot' && <button className="forgot-link back-login" onClick={()=>openAuth('login')}>Voltar para Entrar</button>}
        </section>
      </div>}

      <nav className="mobile-bottom-nav" aria-label="Navegação inferior">
        <button className={!showFavorites && !showCart && !showDashboard && !selectedNFT ? 'active' : ''} onClick={() => { setShowFavorites(false); setShowCart(false); setShowCheckout(false); setShowConfirmation(false); setShowDashboard(false); setSelectedNFT(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Página inicial"><House size={22}/><span>Início</span></button>
        <button className={showFavorites ? 'active' : ''} onClick={() => { setShowFavorites(true); setShowCart(false); setShowCheckout(false); setShowDashboard(false); setSelectedNFT(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Favoritos"><Heart size={22}/><span>Favoritos</span></button>
        <button className={showCart ? 'active' : ''} onClick={() => { setShowCart(true); setShowFavorites(false); setShowCheckout(false); setShowDashboard(false); setSelectedNFT(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label={`Carrinho, ${cartCount} itens`}><ShoppingCart size={22}/><span>Carrinho{cartCount ? ` (${cartCount})` : ''}</span></button>
        <button className={showDashboard || loginOpen ? 'active' : ''} onClick={() => { setShowFavorites(false); if (authUser) { setShowDashboard(true); setShowCart(false); setSelectedNFT(null) } else openAuth('login') }} aria-label="Entrar ou acessar perfil"><UserRound size={22}/><span>{authUser ? 'Perfil' : 'Entrar'}</span></button>
      </nav>

      <footer className="site-footer">
        <div className="footer-contact">
          <a href="mailto:contato@email.com">contato@email.com</a>
          <a href="tel:+551140028922">+55 11 4002-8922</a>
        </div>
        <div className="social-block">
          <h2>Redes sociais</h2>
          <div className="social-links">
            <a href="https://instagram.com" aria-label="Instagram"><Instagram /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><Linkedin /></a>
            <a href="https://facebook.com" aria-label="Facebook"><Facebook /></a>
            <a href="https://x.com" aria-label="Twitter / X"><X /></a>
            <a href="https://youtube.com" aria-label="YouTube"><Youtube /></a>
          </div>
        </div>
        <p className="copyright">© 2026 Kurio. Propriedade digital para todos.</p>
      </footer>
    </div>
  )
}

export default App
