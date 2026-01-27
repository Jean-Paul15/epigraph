'use client'

import Link from 'next/link'
import { 
  Activity, 
  Users, 
  Building2, 
  TrendingUp,
  ArrowRight,
  Database,
  Network,
  Brain,
  ChevronRight
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'Contact Tracing',
      description: 'Tracez les chaînes de contamination en temps réel',
      href: '/dashboard/contact-tracing',
      color: 'bg-blue-500',
    },
    {
      icon: Network,
      title: 'Détection de Clusters',
      description: 'Identifiez les foyers épidémiques avec Louvain',
      href: '/dashboard/clusters',
      color: 'bg-purple-500',
    },
    {
      icon: Brain,
      title: 'Prédictions ML',
      description: 'Anticipez les risques avec le Machine Learning',
      href: '/dashboard/predictions',
      color: 'bg-amber-500',
    },
    {
      icon: Building2,
      title: 'Ressources Hospitalières',
      description: 'Optimisez l\'allocation des lits et transferts',
      href: '/dashboard/hospitals',
      color: 'bg-emerald-500',
    },
  ]

  const stats = [
    { label: 'Patients', value: '40K+', icon: Users, color: 'text-blue-600' },
    { label: 'Hôpitaux', value: '200+', icon: Building2, color: 'text-emerald-600' },
    { label: 'Connexions', value: '126K+', icon: Database, color: 'text-purple-600' },
    { label: 'Clusters', value: '20+', icon: Network, color: 'text-amber-600' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-semibold text-gray-900">EpiGraph</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight">
              Analyse épidémiologique
              <span className="block text-blue-600">propulsée par Neo4j</span>
            </h1>
            
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Visualisez les réseaux de contamination, détectez les clusters épidémiques 
              et anticipez les risques grâce à la puissance des graphes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center gap-2 
                         bg-blue-600 text-white px-8 py-4 rounded-xl
                         font-medium text-lg hover:bg-blue-700 transition-colors"
              >
                Accéder au Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="http://localhost:7474" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center gap-2 
                         bg-gray-100 text-gray-700 px-8 py-4 rounded-xl
                         font-medium text-lg hover:bg-gray-200 transition-colors"
              >
                <Database className="w-5 h-5" />
                Neo4j Browser
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-2xl p-6 text-center
                         hover:shadow-lg transition-shadow"
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-semibold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Fonctionnalités Avancées
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Exploitez la puissance des graphes pour l'analyse épidémiologique
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group bg-white border border-gray-200 rounded-2xl p-8 
                         hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className={`${feature.color} w-12 h-12 rounded-xl 
                    flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 
                                 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                      {feature.title}
                      <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 
                                              group-hover:opacity-100 group-hover:translate-x-0 
                                              transition-all" />
                    </h3>
                    <p className="text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white border border-gray-200 rounded-3xl p-12 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Prêt à explorer les données ?
            </h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">
              Accédez au dashboard interactif pour visualiser les réseaux 
              épidémiques et exécuter des analyses en temps réel.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white 
                       px-8 py-4 rounded-xl font-medium text-lg 
                       hover:bg-blue-700 transition-colors"
            >
              Lancer le Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p className="font-medium">EpiGraph - Projet Neo4j Santé</p>
          <p className="text-sm mt-2">
            Données COVID-19 Johns Hopkins + Réseau simulé SEIR
          </p>
        </div>
      </footer>
    </div>
  )
}
