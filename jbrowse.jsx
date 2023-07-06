

const { createViewState, JBrowseLinearGenomeView } = JBrowseReactLinearGenomeView


const createConfig = ({chrom, regionStart, regionEnd, strand}) => {

  //console.log([chrom, regionStart, regionEnd, strand])

  const assembly = {
    name: 'GRCh38',
    aliases: ['hg38'],
    sequence: {
      type: 'ReferenceSequenceTrack',
      trackId: 'GRCh38-ReferenceSequenceTrack',
      adapter: {
        type: 'BgzipFastaAdapter',
        fastaLocation: {
          uri: 'https://jbrowse.org/genomes/GRCh38/fasta/hg38.prefix.fa.gz',
        },
        faiLocation: {
          uri: 'https://jbrowse.org/genomes/GRCh38/fasta/hg38.prefix.fa.gz.fai',
        },
        gziLocation: {
          uri: 'https://jbrowse.org/genomes/GRCh38/fasta/hg38.prefix.fa.gz.gzi',
        },
      },
    },
    refNameAliases: {
      adapter: {
        type: 'RefNameAliasAdapter',
        location: {
          uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/hg38_aliases.txt',
        },
      },
    },
  }

  const defaultSession = {
    name: 'this session',
    margin: 0,
    view: {
      id: 'linearGenomeView',
      minimized: false,
      type: 'LinearGenomeView',
      offsetPx: 14762,
      bpPerPx: 0.5,
      displayedRegions: [
        {
          refName: chrom,
          start: regionStart-1000,
          end: regionEnd+1000,
          reversed: false,
          assemblyName: 'GRCh38',
        },
      ],
      tracks: [
        {
          id: '4aZAiE-A3',
          type: 'ReferenceSequenceTrack',
          configuration: 'GRCh38-ReferenceSequenceTrack',
          minimized: false,
          displays: [
            {
              id: 'AD3gqvG0_6',
              type: 'LinearReferenceSequenceDisplay',
              height: 100,
              configuration:
                  'GRCh38-ReferenceSequenceTrack-LinearReferenceSequenceDisplay',
              showForward: true,
              showReverse: true,
              showTranslation: true,
            },
          ],
        },
        {
          id: 'EUnTnpVI6',
          type: 'FeatureTrack',
          configuration: 'Transcripts',
          minimized: false,
          displays: [
            {
              id: 'mrlawr9Wtg',
              type: 'LinearBasicDisplay',
              height: 100,
              selectedRendering: '',
              resolution: 1,
              constraints: {},
            },
          ],
        },
        {
          id: 'EUnT3gqv6',
          type: 'FeatureTrack',
          configuration: 'Proteins',
          minimized: false,
          displays: [
            {
              id: 'mrlawr9Wtg',
              type: 'LinearBasicDisplay',
              height: 100,
              selectedRendering: '',
              resolution: 1,
              constraints: {},
            },
          ],
        },
      ],
      hideHeader: false,
      hideHeaderOverview: false,
      hideNoTracksActive: false,
      trackSelectorType: 'hierarchical',
      trackLabels: 'overlapping',
      showCenterLine: false,
      showCytobandsSetting: true,
      showGridlines: true,
    },
  }

  const tracks = [
    {
      type: 'FeatureTrack',
      trackId: 'genes',
      name: 'NCBI RefSeq Genes',
      assemblyNames: ['GRCh38'],
      category: ['Genes'],
      adapter: {
        type: 'Gff3TabixAdapter',
        gffGzLocation: {
          uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/ncbi_refseq/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz',
        },
        index: {
          location: {
            uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/ncbi_refseq/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz.tbi',
          },
        },
      },
      textSearching: {
        textSearchAdapter: {
          type: 'TrixTextSearchAdapter',
          textSearchAdapterId: 'gff3tabix_genes-index',
          ixFilePath: {
            uri: 'https://jbrowse.org/genomes/GRCh38/ncbi_refseq/trix/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz.ix',
          },
          ixxFilePath: {
            uri: 'https://jbrowse.org/genomes/GRCh38/ncbi_refseq/trix/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz.ixx',
          },
          metaFilePath: {
            uri: 'https://jbrowse.org/genomes/GRCh38/ncbi_refseq/trix/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz_meta.json',
          },
          assemblyNames: ['GRCh38'],
        },
      },
    },
    {
      type: 'FeatureTrack',
      trackId: 'Transcripts',
      name: 'Transcripts',
      assemblyNames: ['hg38'],
      adapter: {
        type: 'BigBedAdapter',
        bigBedLocation: {
          uri: 'https://api.openprot.org/api/2.0/files/pg/output/pg_gen_beds_t_tt-ensembl.HS/transcripts-ensembl-HS.bb',
          locationType: 'UriLocation',
        },
      },
    },
    {
      type: 'FeatureTrack',
      trackId: 'Proteins',
      name: 'Proteins',
      assemblyNames: ['hg38'],
      adapter: {
        type: 'BigBedAdapter',
        bigBedLocation: {
          uri: 'https://api.openprot.org/api/2.0/files/pg/output/pg_gen_beds_t_tt-ensembl.HS/transcript-translations-ensembl-HS.bb',
          locationType: 'UriLocation',
        },
      },
    }
  ]
const location =`${chrom}:${regionStart-100}..${regionEnd+100}`
  return {
    assembly,
    defaultSession,
    tracks,
    location
  }
}


window.onload = function () {


  window.addEventListener("message", e => {

    const messageFromParent = JSON.parse(e.data)

    const {
      assembly,
      defaultSession,
      tracks,
      location
    } = createConfig(messageFromParent)

    const state = new createViewState({
      assembly,
      tracks,
      defaultSession,
      location
    })

    const domContainer = document.getElementById('jbrowse_linear_genome_view')

    ReactDOM.render(
      React.createElement(JBrowseLinearGenomeView, { 
        viewState: state
      }),
      domContainer,
    )
  })
}
